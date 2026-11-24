import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { tv4Api } from '../../services/api';
import ExcelActions from './components/ExcelActions';
import ExcelUpload from './components/ExcelUpload';
import ExcelPreview from './components/ExcelPreview';
import './Excel.css';

const INITIAL_STATS_FILTER = {
  cheDo: 'KY',
  kieuThongKe: 'THANG',
  nam: String(new Date().getFullYear()),
  quy: '1',
  tuNgay: '',
  denNgay: '',
};

const EXPORTS = {
  phong: { method: 'xuatExcelPhong', filename: 'danh-sach-phong.xlsx' },
  thuePhong: { method: 'xuatExcelThuePhong', filename: 'danh-sach-thue-phong.xlsx' },
  hoaDon: { method: 'xuatExcelHoaDon', filename: 'danh-sach-hoa-don.xlsx' },
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.detail || data?.error || error?.message || fallback;
}

function saveBlob(blobData, filename) {
  const blob = blobData instanceof Blob
    ? blobData
    : new Blob([blobData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export default function ExcelPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('export');
  const [statsFilter, setStatsFilter] = useState(INITIAL_STATS_FILTER);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [notice, setNotice] = useState(null);

  const isBusy = Boolean(busyAction);
  const canImport = useMemo(
    () => Boolean(
      preview
      && preview.loaiDuLieu === 'PHONG'
      && preview.thanhCong === true
      && Number(preview.soDongLoi || 0) === 0
      && Number(preview.soDongHopLe || 0) > 0
      && Number(preview.soDongDaNhap || 0) === 0
    ),
    [preview]
  );

  const handleUnauthorized = (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      navigate('/dang-nhap');
      return true;
    }
    return false;
  };

  const handleExport = async (type) => {
    setNotice(null);
    setBusyAction(type);
    try {
      let response;
      let filename;

      if (type === 'thongKe') {
        const params = {};
        if (statsFilter.cheDo === 'KHOANG_NGAY') {
          if (!statsFilter.tuNgay || !statsFilter.denNgay) {
            setNotice({ type: 'error', text: 'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.' });
            return;
          }
          if (statsFilter.tuNgay > statsFilter.denNgay) {
            setNotice({ type: 'error', text: 'Ngày bắt đầu không được lớn hơn ngày kết thúc.' });
            return;
          }
          params.tuNgay = statsFilter.tuNgay;
          params.denNgay = statsFilter.denNgay;
        } else {
          const year = Number(statsFilter.nam);
          if (!Number.isInteger(year) || year < 1000 || year > 9999) {
            setNotice({ type: 'error', text: 'Năm thống kê phải nằm trong khoảng 1000–9999.' });
            return;
          }
          params.kieuThongKe = statsFilter.kieuThongKe;
          params.nam = year;
          if (statsFilter.kieuThongKe === 'QUY') params.quy = Number(statsFilter.quy);
        }
        response = await tv4Api.xuatExcelThongKe(params);
        filename = 'bao-cao-doanh-thu.xlsx';
      } else {
        const config = EXPORTS[type];
        response = await tv4Api[config.method]();
        filename = config.filename;
      }

      saveBlob(response.data, filename);
      setNotice({ type: 'success', text: `Đã tạo file ${filename}.` });
    } catch (error) {
      if (handleUnauthorized(error)) return;
      setNotice({ type: 'error', text: getErrorMessage(error, 'Không thể xuất file Excel.') });
    } finally {
      setBusyAction('');
    }
  };

  const handleReadFile = async () => {
    if (!selectedFile) {
      setNotice({ type: 'error', text: 'Vui lòng chọn file Excel trước khi đọc.' });
      return;
    }
    setBusyAction('read');
    setNotice(null);
    setPreview(null);
    try {
      const response = await tv4Api.docFileExcel(selectedFile);
      setPreview(response.data);
      setNotice({
        type: response.data?.thanhCong ? 'success' : 'warning',
        text: response.data?.thongBao || 'Đã đọc file Excel.',
      });
    } catch (error) {
      if (handleUnauthorized(error)) return;
      setNotice({ type: 'error', text: getErrorMessage(error, 'Không thể đọc file Excel.') });
    } finally {
      setBusyAction('');
    }
  };

  const handleConfirmImport = async () => {
    if (!canImport || !preview?.danhSachDong?.length) return;

    const confirmed = window.confirm(
      `Bạn xác nhận nhập ${preview.soDongHopLe} phòng vào database? Dữ liệu trùng hoặc không hợp lệ sẽ khiến toàn bộ đợt nhập bị từ chối.`
    );
    if (!confirmed) return;

    setBusyAction('import');
    setNotice(null);
    const payload = {
      loaiDuLieu: preview.loaiDuLieu,
      danhSachPhong: preview.danhSachDong.map((row) => ({
        soDongExcel: row.soDongExcel,
        maPhong: row.maPhong,
        soPhong: row.soPhong,
        maLoai: row.maLoai,
        tenLoai: row.tenLoai,
        moTa: row.moTa,
        giaPhong: row.giaPhong,
        trangThai: row.trangThai,
      })),
    };

    try {
      const response = await tv4Api.ghiDatabaseTuExcel(payload);
      setPreview(response.data);
      setNotice({
        type: response.data?.thanhCong ? 'success' : 'error',
        text: response.data?.thongBao || 'Đã xử lý yêu cầu nhập dữ liệu.',
      });
    } catch (error) {
      if (handleUnauthorized(error)) return;
      const responseData = error?.response?.data;
      if (responseData?.danhSachDong) setPreview(responseData);
      setNotice({ type: 'error', text: getErrorMessage(error, 'Không thể ghi dữ liệu vào database.') });
    } finally {
      setBusyAction('');
    }
  };

  const handleChooseFile = (file) => {
    setSelectedFile(file);
    setPreview(null);
    setNotice(null);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Mã phòng', 'Số phòng', 'Mã loại', 'Tên loại phòng', 'Mô tả', 'Giá phòng', 'Trạng thái'];
    const example = ['P_EXAMPLE', '901', 'MA_LOAI_TON_TAI', 'Thay bằng tên loại phòng', '', '', 'Trống'];
    const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
    worksheet['!cols'] = [
      { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 26 },
      { wch: 32 }, { wch: 18 }, { wch: 20 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachPhong');
    const instructions = XLSX.utils.aoa_to_sheet([
      ['HƯỚNG DẪN NHẬP DANH SÁCH PHÒNG'],
      ['1. Điền dữ liệu thật vào sheet DanhSachPhong.'],
      ['2. Thay hoặc xóa dòng dữ liệu mẫu ở dòng 2.'],
      ['3. Mã loại phải tồn tại trong bảng LoaiPhong.'],
      ["4. Trạng thái chỉ nhận 'Trống' hoặc 'Đang sử dụng'."],
      ['5. Mã phòng và số phòng không được trùng database hoặc trong file.'],
      ['6. Chỉ nhập mới phòng; không cập nhật phòng đang có.'],
    ]);
    instructions['!cols'] = [{ wch: 90 }];
    XLSX.utils.book_append_sheet(workbook, instructions, 'HuongDan');
    XLSX.writeFile(workbook, 'mau-nhap-danh-sach-phong.xlsx');
  };

  return (
    <div className="tv4-excel space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f667a]">Quản lý dữ liệu</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Nhập / Xuất Excel</h1>
          <p className="mt-1 text-sm text-slate-500">Xuất báo cáo hệ thống hoặc nhập mới danh sách phòng từ tệp .xlsx.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 sm:self-auto">
          <FileSpreadsheet size={16} className="text-emerald-600" /> Định dạng .xlsx
        </span>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          className={`tv4-excel-tab ${activeTab === 'export' ? 'tv4-excel-tab-active' : ''}`}
          onClick={() => { setActiveTab('export'); setNotice(null); }}
        >
          <Download size={16} /> Xuất Excel
        </button>
        <button
          type="button"
          className={`tv4-excel-tab ${activeTab === 'import' ? 'tv4-excel-tab-active' : ''}`}
          onClick={() => { setActiveTab('import'); setNotice(null); }}
        >
          <Upload size={16} /> Nhập Excel
        </button>
      </div>

      {notice && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          notice.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : notice.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-red-200 bg-red-50 text-red-700'
        }`} role="status">
          {notice.text}
        </div>
      )}

      {activeTab === 'export' ? (
        <ExcelActions
          busyAction={busyAction}
          statsFilter={statsFilter}
          onStatsFilterChange={setStatsFilter}
          onExport={handleExport}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <strong>Phạm vi nhập hiện tại:</strong> chỉ hỗ trợ nhập mới dữ liệu phòng. Mã loại phòng phải có sẵn trong database. Hệ thống không cập nhật hoặc ghi đè phòng đã tồn tại.
          </div>
          <ExcelUpload
            selectedFile={selectedFile}
            busy={isBusy}
            onChooseFile={handleChooseFile}
            onReadFile={handleReadFile}
            onDownloadTemplate={handleDownloadTemplate}
          />
          <ExcelPreview
            preview={preview}
            busy={busyAction === 'import'}
            canImport={canImport}
            onConfirmImport={handleConfirmImport}
          />
        </div>
      )}
    </div>
  );
}
