import React, { useEffect, useState } from 'react';
import { Search, RotateCcw, Plus, Pencil, Trash2, Users, Sparkles, X } from 'lucide-react';
import { tv2Api } from '../../services/api';

const KH_MAC_DINH = { maKhachHang: '', tenKhachHang: '', diaChi: '', soDienThoai: '' };
const DV_MAC_DINH = { maDichVu: '', tenDichVu: '', giaDichVu: '' };

// Tách mảng an toàn để tránh crash nếu API trả về định dạng khác mảng trực tiếp
const tachMang = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

// Lấy thông báo lỗi từ Backend
const layThongBaoLoi = (err, macDinh) => {
  return err?.response?.data?.message || err?.response?.data?.error || macDinh;
};

// Nhận diện lỗi ràng buộc khóa ngoại từ MySQL
const laLoiKhoaNgoai = (msg = '') => {
  const lower = msg.toLowerCase();
  return lower.includes('foreign key') || lower.includes('constraint');
};

export default function KhachHangDichVuPage() {
  const [dsKH, setDsKH] = useState([]);
  const [formKH, setFormKH] = useState(KH_MAC_DINH);
  const [tuKhoaKH, setTuKhoaKH] = useState('');
  const [dangChonKH, setDangChonKH] = useState(false);

  const [dsDV, setDsDV] = useState([]);
  const [formDV, setFormDV] = useState(DV_MAC_DINH);
  const [tuKhoaDV, setTuKhoaDV] = useState('');
  const [dangChonDV, setDangChonDV] = useState(false);

  const [thongBao, setThongBao] = useState({ noiDung: '', loai: '' });

  const hienThongBao = (noiDung, loai = 'success') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao({ noiDung: '', loai: '' }), 3000);
  };

  const taiDSKhachHang = async (tuKhoa = '') => {
    try {
      const res = await tv2Api.layDSKH(tuKhoa);
      setDsKH(tachMang(res));
    } catch (e) {
      console.error(e);
      hienThongBao(layThongBaoLoi(e, 'Không tải được danh sách khách hàng'), 'error');
    }
  };

  const taiDSDichVu = async (tuKhoa = '') => {
    try {
      const res = await tv2Api.layDSDichVu(tuKhoa);
      setDsDV(tachMang(res));
    } catch (e) {
      console.error(e);
      hienThongBao(layThongBaoLoi(e, 'Không tải được danh sách dịch vụ'), 'error');
    }
  };

  useEffect(() => {
    taiDSKhachHang();
    taiDSDichVu();
  }, []);

  // --- Xử lý Khách hàng ---
  const chonKhachHang = (kh) => {
    setFormKH({
      maKhachHang: kh.maKhachHang || '',
      tenKhachHang: kh.tenKhachHang || '',
      diaChi: kh.diaChi || '',
      soDienThoai: kh.soDienThoai || '',
    });
    setDangChonKH(true);
  };

  const resetKhachHang = () => {
    setFormKH(KH_MAC_DINH);
    setDangChonKH(false);
  };

  const xuLyThemKH = async () => {
    if (!formKH.tenKhachHang.trim()) {
      hienThongBao('Vui lòng nhập tên khách hàng', 'error');
      return;
    }
    try {
      const res = await tv2Api.themKH({
        maKhachHang: '',
        tenKhachHang: formKH.tenKhachHang.trim(),
        diaChi: formKH.diaChi.trim(),
        soDienThoai: formKH.soDienThoai.trim(),
      });
      hienThongBao(`Đã thêm khách hàng mới (${res.data?.maKhachHang || ''})`);
      resetKhachHang();
      taiDSKhachHang(tuKhoaKH);
    } catch (e) {
      hienThongBao(layThongBaoLoi(e, 'Không thể thêm khách hàng'), 'error');
    }
  };

  const xuLySuaKH = async () => {
    if (!formKH.maKhachHang.trim()) {
      hienThongBao('Chọn một khách hàng trong bảng để sửa', 'error');
      return;
    }
    if (!formKH.tenKhachHang.trim()) {
      hienThongBao('Tên khách hàng không được để trống', 'error');
      return;
    }
    try {
      await tv2Api.suaKH(formKH.maKhachHang, {
        ...formKH,
        tenKhachHang: formKH.tenKhachHang.trim(),
        diaChi: formKH.diaChi.trim(),
        soDienThoai: formKH.soDienThoai.trim(),
      });
      hienThongBao('Đã cập nhật khách hàng');
      taiDSKhachHang(tuKhoaKH);
    } catch (e) {
      hienThongBao(layThongBaoLoi(e, 'Không thể cập nhật khách hàng'), 'error');
    }
  };

  const xuLyXoaKH = async () => {
    if (!formKH.maKhachHang.trim()) {
      hienThongBao('Chọn một khách hàng cần xóa', 'error');
      return;
    }
    if (!window.confirm(`Xóa khách hàng ${formKH.tenKhachHang} (${formKH.maKhachHang})?`)) return;
    try {
      await tv2Api.xoaKH(formKH.maKhachHang);
      hienThongBao('Đã xóa khách hàng');
      resetKhachHang();
      taiDSKhachHang(tuKhoaKH);
    } catch (e) {
      const msg = layThongBaoLoi(e, '');
      hienThongBao(
        laLoiKhoaNgoai(msg)
          ? 'Khách hàng đang có phiếu thuê, không thể xóa'
          : msg || 'Không thể xóa khách hàng',
        'error'
      );
    }
  };

  // --- Xử lý Dịch vụ ---
  const chonDichVu = (dv) => {
    setFormDV({
      maDichVu: dv.maDichVu || '',
      tenDichVu: dv.tenDichVu || '',
      giaDichVu: dv.giaDichVu ?? '',
    });
    setDangChonDV(true);
  };

  const resetDichVu = () => {
    setFormDV(DV_MAC_DINH);
    setDangChonDV(false);
  };

  const xuLyThemDV = async () => {
    if (!formDV.tenDichVu.trim() || formDV.giaDichVu === '' || Number(formDV.giaDichVu) < 0) {
      hienThongBao('Vui lòng nhập tên dịch vụ và đơn giá hợp lệ (>= 0)', 'error');
      return;
    }
    try {
      const res = await tv2Api.themDichVu({
        maDichVu: '',
        tenDichVu: formDV.tenDichVu.trim(),
        giaDichVu: Number(formDV.giaDichVu),
      });
      hienThongBao(`Đã thêm dịch vụ mới (${res.data?.maDichVu || ''})`);
      resetDichVu();
      taiDSDichVu(tuKhoaDV);
    } catch (e) {
      hienThongBao(layThongBaoLoi(e, 'Không thể thêm dịch vụ'), 'error');
    }
  };

  const xuLySuaDV = async () => {
    if (!formDV.maDichVu.trim()) {
      hienThongBao('Chọn một dịch vụ trong bảng để sửa', 'error');
      return;
    }
    if (!formDV.tenDichVu.trim() || formDV.giaDichVu === '' || Number(formDV.giaDichVu) < 0) {
      hienThongBao('Tên dịch vụ không được trống và đơn giá phải >= 0', 'error');
      return;
    }
    try {
      await tv2Api.suaDichVu(formDV.maDichVu, {
        ...formDV,
        tenDichVu: formDV.tenDichVu.trim(),
        giaDichVu: Number(formDV.giaDichVu),
      });
      hienThongBao('Đã cập nhật dịch vụ');
      taiDSDichVu(tuKhoaDV);
    } catch (e) {
      hienThongBao(layThongBaoLoi(e, 'Không thể cập nhật dịch vụ'), 'error');
    }
  };

  const xuLyXoaDV = async () => {
    if (!formDV.maDichVu.trim()) {
      hienThongBao('Chọn một dịch vụ cần xóa', 'error');
      return;
    }
    if (!window.confirm(`Xóa dịch vụ ${formDV.tenDichVu} (${formDV.maDichVu})?`)) return;
    try {
      await tv2Api.xoaDichVu(formDV.maDichVu);
      hienThongBao('Đã xóa dịch vụ');
      resetDichVu();
      taiDSDichVu(tuKhoaDV);
    } catch (e) {
      const msg = layThongBaoLoi(e, '');
      hienThongBao(
        laLoiKhoaNgoai(msg)
          ? 'Dịch vụ đang được sử dụng, không thể xóa'
          : msg || 'Không thể xóa dịch vụ',
        'error'
      );
    }
  };

  return (
    <div className="tv2-modern">
      <style>{`
        .tv2-modern {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 4px;
          color: #1e293b;
        }
        .tv2-toast {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
        }
        .tv2-toast.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .tv2-toast.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .tv2-section {
          display: grid;
          grid-template-columns: 1.65fr 1fr;
          gap: 18px;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .tv2-section {
            grid-template-columns: 1fr;
          }
        }
        .tv2-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }
        .tv2-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 15px 18px;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
        }
        .tv2-header-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
        }
        .tv2-count-badge {
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .tv2-search-bar {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tv2-search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .tv2-search-input-wrap svg {
          position: absolute;
          left: 10px;
          color: #94a3b8;
          pointer-events: none;
        }
        .tv2-search-input {
          padding: 7px 28px 7px 32px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          font-size: 13px;
          width: 220px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tv2-search-input:focus {
          border-color: #2f667a;
          box-shadow: 0 0 0 3px rgba(47, 102, 122, 0.12);
        }
        .tv2-clear-btn {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .tv2-clear-btn:hover {
          color: #475569;
        }
        .tv2-table-scroll {
          max-height: 310px;
          overflow-y: auto;
        }
        .tv2-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .tv2-table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          padding: 11px 16px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .tv2-table td {
          padding: 11px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .tv2-table tbody tr {
          transition: background-color 0.12s;
          cursor: pointer;
        }
        .tv2-table tbody tr:hover {
          background-color: #f8fafc;
        }
        .tv2-table tbody tr.selected {
          background-color: #f0f9ff;
        }
        .tv2-code-pill {
          display: inline-block;
          font-weight: 600;
          font-size: 12.5px;
          color: #26596a;
          background: #e0f2fe;
          padding: 2px 8px;
          border-radius: 5px;
        }
        .tv2-price-text {
          font-weight: 600;
          color: #0f766e;
        }
        .tv2-form-body {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .tv2-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .tv2-field label {
          font-size: 12.5px;
          font-weight: 600;
          color: #475569;
        }
        .tv2-field input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          font-size: 13.5px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tv2-field input:focus {
          border-color: #2f667a;
          box-shadow: 0 0 0 3px rgba(47, 102, 122, 0.12);
        }
        .tv2-field input:disabled {
          background: #f1f5f9;
          color: #64748b;
          cursor: not-allowed;
        }
        .tv2-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .tv2-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tv2-btn-primary {
          background: #26596a;
          color: #ffffff;
        }
        .tv2-btn-primary:hover {
          background: #1e4755;
        }
        .tv2-btn-amber {
          background: #f59e0b;
          color: #ffffff;
        }
        .tv2-btn-amber:hover {
          background: #d97706;
        }
        .tv2-btn-danger {
          background: #ef4444;
          color: #ffffff;
        }
        .tv2-btn-danger:hover {
          background: #dc2626;
        }
        .tv2-btn-ghost {
          background: #f1f5f9;
          color: #475569;
          border-color: #e2e8f0;
        }
        .tv2-btn-ghost:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>

      {thongBao.noiDung && (
        <div className={`tv2-toast ${thongBao.loai}`}>
          <span>{thongBao.noiDung}</span>
        </div>
      )}

      {/* KHÁCH HÀNG */}
      <div className="tv2-section">
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <Users size={18} color="#26596a" />
              <span>Danh sách khách hàng</span>
              <span className="tv2-count-badge">{dsKH.length}</span>
            </div>

            <div className="tv2-search-bar">
              <div className="tv2-search-input-wrap">
                <Search size={15} />
                <input
                  className="tv2-search-input"
                  value={tuKhoaKH}
                  placeholder="Tìm tên, SĐT, địa chỉ..."
                  onChange={(e) => setTuKhoaKH(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && taiDSKhachHang(tuKhoaKH.trim())}
                />
                {tuKhoaKH && (
                  <button
                    className="tv2-clear-btn"
                    title="Xóa tìm kiếm"
                    onClick={() => {
                      setTuKhoaKH('');
                      taiDSKhachHang('');
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                className="tv2-btn tv2-btn-primary"
                onClick={() => taiDSKhachHang(tuKhoaKH.trim())}
              >
                Tìm
              </button>
            </div>
          </div>

          <div className="tv2-table-scroll">
            <table className="tv2-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Mã KH</th>
                  <th>Họ và tên</th>
                  <th>Địa chỉ</th>
                  <th style={{ width: '130px' }}>Số điện thoại</th>
                </tr>
              </thead>
              <tbody>
                {dsKH.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '28px', color: '#94a3b8' }}>
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                ) : (
                  dsKH.map((kh) => (
                    <tr
                      key={kh.maKhachHang}
                      className={dangChonKH && formKH.maKhachHang === kh.maKhachHang ? 'selected' : ''}
                      onClick={() => chonKhachHang(kh)}
                    >
                      <td>
                        <span className="tv2-code-pill">{kh.maKhachHang}</span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>{kh.tenKhachHang}</td>
                      <td>{kh.diaChi || '-'}</td>
                      <td>{kh.soDienThoai || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Khách hàng */}
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <span>{dangChonKH ? `Chỉnh sửa: ${formKH.maKhachHang}` : 'Thông tin khách hàng'}</span>
            </div>
          </div>
          <div className="tv2-form-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
              <div className="tv2-field">
                <label>Mã khách hàng</label>
                <input
                  value={formKH.maKhachHang}
                  disabled
                  placeholder="Tự động sinh"
                />
              </div>
              <div className="tv2-field">
                <label>Số điện thoại</label>
                <input
                  value={formKH.soDienThoai}
                  maxLength={15}
                  placeholder="VD: 0901234567"
                  onChange={(e) => setFormKH({ ...formKH, soDienThoai: e.target.value })}
                />
              </div>
            </div>

            <div className="tv2-field">
              <label>Tên khách hàng</label>
              <input
                value={formKH.tenKhachHang}
                placeholder="Nhập họ và tên khách hàng"
                onChange={(e) => setFormKH({ ...formKH, tenKhachHang: e.target.value })}
              />
            </div>

            <div className="tv2-field">
              <label>Địa chỉ</label>
              <input
                value={formKH.diaChi}
                placeholder="Nhập địa chỉ liên hệ"
                onChange={(e) => setFormKH({ ...formKH, diaChi: e.target.value })}
              />
            </div>

            <div className="tv2-actions">
              <button className="tv2-btn tv2-btn-primary" onClick={xuLyThemKH}>
                <Plus size={15} /> Thêm
              </button>
              <button className="tv2-btn tv2-btn-amber" onClick={xuLySuaKH}>
                <Pencil size={15} /> Sửa
              </button>
              <button className="tv2-btn tv2-btn-danger" onClick={xuLyXoaKH}>
                <Trash2 size={15} /> Xóa
              </button>
              <button className="tv2-btn tv2-btn-ghost" onClick={resetKhachHang}>
                <RotateCcw size={15} /> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DỊCH VỤ */}
      <div className="tv2-section">
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <Sparkles size={18} color="#26596a" />
              <span>Danh mục dịch vụ</span>
              <span className="tv2-count-badge">{dsDV.length}</span>
            </div>

            <div className="tv2-search-bar">
              <div className="tv2-search-input-wrap">
                <Search size={15} />
                <input
                  className="tv2-search-input"
                  value={tuKhoaDV}
                  placeholder="Tìm mã hoặc tên dịch vụ..."
                  onChange={(e) => setTuKhoaDV(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && taiDSDichVu(tuKhoaDV.trim())}
                />
                {tuKhoaDV && (
                  <button
                    className="tv2-clear-btn"
                    title="Xóa tìm kiếm"
                    onClick={() => {
                      setTuKhoaDV('');
                      taiDSDichVu('');
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                className="tv2-btn tv2-btn-primary"
                onClick={() => taiDSDichVu(tuKhoaDV.trim())}
              >
                Tìm
              </button>
            </div>
          </div>

          <div className="tv2-table-scroll">
            <table className="tv2-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Mã DV</th>
                  <th>Tên dịch vụ</th>
                  <th style={{ width: '160px', textAlign: 'right' }}>Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                {dsDV.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '28px', color: '#94a3b8' }}>
                      Không tìm thấy dịch vụ nào
                    </td>
                  </tr>
                ) : (
                  dsDV.map((dv) => (
                    <tr
                      key={dv.maDichVu}
                      className={dangChonDV && formDV.maDichVu === dv.maDichVu ? 'selected' : ''}
                      onClick={() => chonDichVu(dv)}
                    >
                      <td>
                        <span className="tv2-code-pill">{dv.maDichVu}</span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>{dv.tenDichVu}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="tv2-price-text">
                          {Number(dv.giaDichVu || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Dịch vụ */}
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <span>{dangChonDV ? `Chỉnh sửa: ${formDV.maDichVu}` : 'Thông tin dịch vụ'}</span>
            </div>
          </div>
          <div className="tv2-form-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
              <div className="tv2-field">
                <label>Mã dịch vụ</label>
                <input
                  value={formDV.maDichVu}
                  disabled
                  placeholder="Tự động sinh"
                />
              </div>
              <div className="tv2-field">
                <label>Đơn giá (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={formDV.giaDichVu}
                  placeholder="VD: 150000"
                  onChange={(e) => setFormDV({ ...formDV, giaDichVu: e.target.value })}
                />
              </div>
            </div>

            <div className="tv2-field">
              <label>Tên dịch vụ</label>
              <input
                value={formDV.tenDichVu}
                placeholder="Nhập tên dịch vụ"
                onChange={(e) => setFormDV({ ...formDV, tenDichVu: e.target.value })}
              />
            </div>

            <div className="tv2-actions">
              <button className="tv2-btn tv2-btn-primary" onClick={xuLyThemDV}>
                <Plus size={15} /> Thêm
              </button>
              <button className="tv2-btn tv2-btn-amber" onClick={xuLySuaDV}>
                <Pencil size={15} /> Sửa
              </button>
              <button className="tv2-btn tv2-btn-danger" onClick={xuLyXoaDV}>
                <Trash2 size={15} /> Xóa
              </button>
              <button className="tv2-btn tv2-btn-ghost" onClick={resetDichVu}>
                <RotateCcw size={15} /> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}