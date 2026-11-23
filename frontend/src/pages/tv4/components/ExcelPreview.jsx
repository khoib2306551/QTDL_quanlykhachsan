import { AlertCircle, CheckCircle2, CircleAlert, Database, FileSpreadsheet, LoaderCircle } from 'lucide-react';

function SummaryItem({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-white text-slate-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    red: 'border-red-200 bg-red-50 text-red-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value ?? 0}</p>
    </div>
  );
}

export default function ExcelPreview({ preview, busy, canImport, onConfirmImport }) {
  if (!preview) {
    return (
      <section className="card-box">
        <div className="card-title">Xem trước dữ liệu</div>
        <div className="py-9 text-center text-sm text-slate-500">
          <FileSpreadsheet size={30} className="mx-auto mb-2 text-slate-300" />
          Chọn file và nhấn “Đọc và xem trước” để hiển thị dữ liệu tại đây.
        </div>
      </section>
    );
  }

  const rows = Array.isArray(preview.danhSachDong) ? preview.danhSachDong : [];
  const imported = Number(preview.soDongDaNhap || 0) > 0;

  return (
    <section className="card-box">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="card-title !mb-1 !border-0 !pb-0">Xem trước dữ liệu nhập</div>
          <p className="text-xs text-slate-500">{preview.tenFile || 'Danh sách phòng'} · Loại dữ liệu: {preview.loaiDuLieu || 'PHONG'}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold ${
          imported
            ? 'bg-emerald-100 text-emerald-800'
            : preview.thanhCong
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
        }`}>
          {imported ? <CheckCircle2 size={14} /> : preview.thanhCong ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
          {imported ? 'Đã nhập database' : preview.thanhCong ? 'Dữ liệu hợp lệ' : 'Cần xử lý lỗi'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <SummaryItem label="Tổng số dòng" value={preview.tongSoDong} />
        <SummaryItem label="Dòng hợp lệ" value={preview.soDongHopLe} tone="green" />
        <SummaryItem label="Dòng có lỗi" value={preview.soDongLoi} tone="red" />
        <SummaryItem label="Đã ghi database" value={preview.soDongDaNhap} tone="blue" />
      </div>

      {preview.thongBao && (
        <div className={`mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm ${
          preview.thanhCong ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          {preview.thanhCong ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" />}
          <span>{preview.thongBao}</span>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-[1050px] w-full border-collapse text-left text-xs">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              {['Dòng Excel', 'Mã phòng', 'Số phòng', 'Mã loại', 'Tên loại phòng', 'Giá phòng', 'Trạng thái', 'Kết quả kiểm tra'].map((title) => (
                <th key={title} className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-bold">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.soDongExcel ?? index}-${row.maPhong ?? index}`} className={row.hopLe ? 'bg-white' : 'bg-red-50/70'}>
                <td className="border-b border-slate-100 px-3 py-3 tabular-nums">{row.soDongExcel ?? index + 2}</td>
                <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-800">{row.maPhong || '—'}</td>
                <td className="border-b border-slate-100 px-3 py-3">{row.soPhong || '—'}</td>
                <td className="border-b border-slate-100 px-3 py-3">{row.maLoai || '—'}</td>
                <td className="border-b border-slate-100 px-3 py-3">{row.tenLoai || '—'}</td>
                <td className="border-b border-slate-100 px-3 py-3 tabular-nums">{row.giaPhong || '—'}</td>
                <td className="border-b border-slate-100 px-3 py-3">{row.trangThai || '—'}</td>
                <td className="border-b border-slate-100 px-3 py-3">
                  {row.hopLe ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 size={14} /> Hợp lệ</span>
                  ) : (
                    <div className="min-w-48 text-red-700">
                      <span className="inline-flex items-center gap-1 font-semibold"><AlertCircle size={14} /> Lỗi</span>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4">
                        {(row.loi || []).map((message, errorIndex) => <li key={errorIndex}>{message}</li>)}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-500">Không có dòng dữ liệu để hiển thị.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
          <Database size={15} className="mt-0.5 shrink-0" />
          Chỉ nhập khi toàn bộ dòng hợp lệ. Backend kiểm tra lại dữ liệu trước khi ghi trong transaction.
        </p>
        <button
          type="button"
          onClick={onConfirmImport}
          disabled={!canImport || busy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Database size={16} />}
          {busy ? 'Đang ghi dữ liệu...' : imported ? 'Đã nhập dữ liệu' : 'Xác nhận nhập database'}
        </button>
      </div>
    </section>
  );
}
