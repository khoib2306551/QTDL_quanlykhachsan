import React, { useEffect, useState } from 'react';
import { CalendarCheck, Filter, RotateCcw, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { tv1Api, tv2Api } from '../../services/api';

const FORM_MAC_DINH = {
  maThue: '',
  maKhachHang: '',
  maPhong: '',
  ngayThue: '',
  ngayNhan: '',
  ngayTra: '',
  trangThai: 'Đã đặt',
};

const tachMang = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.content)) return body.content;
  return [];
};

const layThongBaoLoi = (err, macDinh) => {
  return err?.response?.data?.message || err?.response?.data?.error || macDinh;
};

export default function ThuePhongPage() {
  const [dsThue, setDsThue] = useState([]);
  const [dsKH, setDsKH] = useState([]);
  const [dsPhong, setDsPhong] = useState([]);
  const [form, setForm] = useState(FORM_MAC_DINH);
  const [dangChon, setDangChon] = useState(false);
  const [daTraPhong, setDaTraPhong] = useState(false);
  const [soNgayLuuTru, setSoNgayLuuTru] = useState(0);
  const [boLocNgay, setBoLocNgay] = useState({
    ngayBatDau: '2026-11-01',
    ngayKetThuc: '2026-11-30',
  });
  const [thongBao, setThongBao] = useState({ noiDung: '', loai: '' });

  const hienThongBao = (noiDung, loai = 'success') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao({ noiDung: '', loai: '' }), 3500);
  };

  const taiDSThuePhong = async () => {
    try {
      const res = await tv2Api.layDSThuePhong();
      setDsThue(tachMang(res));
    } catch (e) {
      console.error('Lỗi tải danh sách thuê phòng:', e);
      hienThongBao(layThongBaoLoi(e, 'Không tải được danh sách thuê phòng'), 'error');
    }
  };

  const taiDanhMucPhuTro = async () => {
    try {
      const resKH = await tv2Api.layDSKH();
      setDsKH(tachMang(resKH));
    } catch (e) {
      console.error('Lỗi tải danh sách khách hàng:', e);
    }

    try {
      const resPhong = await tv1Api.layDSPhong(100, 1);
      setDsPhong(tachMang(resPhong));
    } catch (e) {
      console.error('Lỗi tải danh sách phòng:', e);
      setDsPhong([]);
    }
  };

  useEffect(() => {
    taiDSThuePhong();
    taiDanhMucPhuTro();
  }, []);

  useEffect(() => {
    if (form.ngayNhan && form.ngayTra) {
      tv2Api
        .tinhSoNgay(form.ngayNhan, form.ngayTra)
        .then((res) => {
          const val = typeof res.data === 'number' ? res.data : (res.data?.data ?? 0);
          setSoNgayLuuTru(val);
        })
        .catch(() => setSoNgayLuuTru(0));
    } else {
      setSoNgayLuuTru(0);
    }
  }, [form.ngayNhan, form.ngayTra]);

  const chonPhieuThue = (tp) => {
    setForm({
      maThue: tp.maThue || '',
      maKhachHang: tp.maKhachHang || '',
      maPhong: tp.maPhong || '',
      ngayThue: tp.ngayThue || '',
      ngayNhan: tp.ngayNhan || '',
      ngayTra: tp.ngayTra || '',
      trangThai: tp.trangThai || 'Đã đặt',
    });
    setSoNgayLuuTru(tp.soNgayLuuTru || 0);
    setDangChon(true);
    setDaTraPhong(tp.trangThai === 'Đã trả');
  };

  const taoMoiForm = () => {
    setForm(FORM_MAC_DINH);
    setSoNgayLuuTru(0);
    setDangChon(false);
    setDaTraPhong(false);
  };

  const xuLyThem = async () => {
    if (!form.maKhachHang.trim() || !form.maPhong.trim()) {
      hienThongBao('Vui lòng chọn đủ khách hàng và phòng', 'error');
      return;
    }
    if (!form.ngayThue || !form.ngayNhan || !form.ngayTra) {
      hienThongBao('Vui lòng chọn đầy đủ ngày thuê, ngày nhận và ngày trả', 'error');
      return;
    }
    if (form.ngayTra < form.ngayNhan) {
      hienThongBao('Ngày trả phòng phải lớn hơn hoặc bằng ngày nhận phòng', 'error');
      return;
    }
    try {
      const res = await tv2Api.themThuePhong({ ...form, maThue: '' });
      hienThongBao(`Đã tạo phiếu thuê mới (${res.data?.maThue || ''})`);
      taoMoiForm();
      taiDSThuePhong();
      taiDanhMucPhuTro();
    } catch (e) {
      hienThongBao(layThongBaoLoi(e, 'Không thể thêm phiếu thuê phòng'), 'error');
    }
  };

  const xuLySua = async () => {
    if (!form.maThue.trim()) {
      hienThongBao('Chọn một phiếu thuê trong bảng để cập nhật', 'error');
      return;
    }
    if (daTraPhong) {
      hienThongBao('Phiếu thuê đã trả phòng, không thể chỉnh sửa', 'error');
      return;
    }
    if (!form.ngayThue || !form.ngayNhan || !form.ngayTra) {
      hienThongBao('Vui lòng chọn đầy đủ ngày thuê, ngày nhận và ngày trả', 'error');
      return;
    }
    if (form.ngayTra < form.ngayNhan) {
      hienThongBao('Ngày trả phòng phải lớn hơn hoặc bằng ngày nhận phòng', 'error');
      return;
    }
    try {
      await tv2Api.suaThuePhong(form.maThue, form);
      hienThongBao('Đã cập nhật phiếu thuê phòng');
      if (form.trangThai === 'Đã trả') {
        setDaTraPhong(true);
      }
      taiDSThuePhong();
      taiDanhMucPhuTro();
    } catch (e) {
      hienThongBao(layThongBaoLoi(e, 'Không thể cập nhật phiếu thuê'), 'error');
    }
  };

  const xuLyXoa = async () => {
    if (!form.maThue.trim()) {
      hienThongBao('Chọn một phiếu thuê cần xóa', 'error');
      return;
    }
    if (!window.confirm(`Xóa phiếu thuê phòng ${form.maThue}?`)) return;
    try {
      await tv2Api.xoaThuePhong(form.maThue);
      hienThongBao('Đã xóa phiếu thuê phòng');
      taoMoiForm();
      taiDSThuePhong();
      taiDanhMucPhuTro();
    } catch (e) {
      hienThongBao(layThongBaoLoi(e, 'Không thể xóa phiếu thuê này'), 'error');
    }
  };

  const locTheoThoiGian = async () => {
    if (!boLocNgay.ngayBatDau || !boLocNgay.ngayKetThuc) {
      hienThongBao('Vui lòng chọn ngày bắt đầu và ngày kết thúc', 'error');
      return;
    }
    if (boLocNgay.ngayKetThuc < boLocNgay.ngayBatDau) {
      hienThongBao('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu', 'error');
      return;
    }
    try {
      const res = await tv2Api.timTheoThoiGian(boLocNgay.ngayBatDau, boLocNgay.ngayKetThuc);
      const ketQua = tachMang(res);
      setDsThue(ketQua);
      hienThongBao(`Tìm thấy ${ketQua.length} phiếu thuê trong khoảng thời gian đã chọn`);
    } catch (e) {
      console.error('Lỗi lọc theo thời gian:', e);
      hienThongBao(layThongBaoLoi(e, 'Không thể lọc danh sách theo thời gian'), 'error');
    }
  };

  const renderBadgeTrangThai = (trangThai) => {
    if (trangThai === 'Đang ở') {
      return <span className="tv2-status tv2-status-active">Đang ở</span>;
    }
    if (trangThai === 'Đã trả') {
      return <span className="tv2-status tv2-status-done">Đã trả</span>;
    }
    return <span className="tv2-status tv2-status-booked">Đã đặt</span>;
  };

  return (
    <div className="tv2-rental">
      <style>{`
        .tv2-rental {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 4px;
          color: #1e293b;
        }
        .tv2-toast {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
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
        .tv2-top-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 18px;
          align-items: stretch;
        }
        @media (max-width: 1100px) {
          .tv2-top-layout {
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
          padding: 14px 18px;
          border-bottom: 1px solid #f1f5f9;
        }
        .tv2-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
        }
        .tv2-form-grid {
          padding: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px 16px;
        }
        .tv2-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .tv2-field.full {
          grid-column: 1 / -1;
        }
        .tv2-field label {
          font-size: 12.5px;
          font-weight: 600;
          color: #475569;
        }
        .tv2-field input,
        .tv2-field select {
          padding: 8px 11px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          font-size: 13.5px;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tv2-field input:focus,
        .tv2-field select:focus {
          border-color: #2f667a;
          box-shadow: 0 0 0 3px rgba(47, 102, 122, 0.12);
        }
        .tv2-field input:disabled,
        .tv2-field select:disabled {
          background: #f1f5f9;
          color: #64748b;
          cursor: not-allowed;
        }
        .tv2-stay-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0369a1;
          padding: 8px 12px;
          border-radius: 7px;
          font-size: 13.5px;
          font-weight: 600;
        }
        .tv2-actions {
          grid-column: 1 / -1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }
        .tv2-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 15px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tv2-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .tv2-btn-primary {
          background: #26596a;
          color: #ffffff;
        }
        .tv2-btn-primary:hover:not(:disabled) {
          background: #1e4755;
        }
        .tv2-btn-amber {
          background: #f59e0b;
          color: #ffffff;
        }
        .tv2-btn-amber:hover:not(:disabled) {
          background: #d97706;
        }
        .tv2-btn-danger {
          background: #ef4444;
          color: #ffffff;
        }
        .tv2-btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }
        .tv2-btn-ghost {
          background: #f1f5f9;
          color: #475569;
          border-color: #e2e8f0;
        }
        .tv2-btn-ghost:hover:not(:disabled) {
          background: #e2e8f0;
          color: #1e293b;
        }
        .tv2-lock-note {
          font-size: 12.5px;
          color: #b45309;
          margin-left: auto;
        }
        .tv2-table-scroll {
          max-height: 360px;
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
          padding: 11px 14px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
          position: sticky;
          top: 0;
        }
        .tv2-table td {
          padding: 11px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .tv2-table tbody tr {
          cursor: pointer;
          transition: background-color 0.12s;
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
        .tv2-days-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 600;
          font-size: 12.5px;
          padding: 3px 9px;
          border-radius: 6px;
        }
        .tv2-status {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .tv2-status-booked {
          background: #fef3c7;
          color: #b45309;
        }
        .tv2-status-active {
          background: #dcfce7;
          color: #15803d;
        }
        .tv2-status-done {
          background: #e2e8f0;
          color: #475569;
        }
      `}</style>

      {thongBao.noiDung && (
        <div className={`tv2-toast ${thongBao.loai}`}>
          <span>{thongBao.noiDung}</span>
        </div>
      )}

      <div className="tv2-top-layout">
        {/* Khung Thông tin phiếu thuê */}
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <CalendarCheck size={18} color="#26596a" />
              <span>{dangChon ? `Phiếu thuê: ${form.maThue}` : 'Thông tin thuê phòng'}</span>
            </div>
            <div className="tv2-stay-box">
              <Clock size={15} style={{ marginRight: 6 }} />
              <span>Lưu trú: {soNgayLuuTru} ngày</span>
            </div>
          </div>

          <div className="tv2-form-grid">
            <div className="tv2-field">
              <label>Mã phiếu thuê</label>
              <input
                value={form.maThue}
                disabled
                placeholder="Tự động sinh khi thêm mới"
              />
            </div>

            <div className="tv2-field">
              <label>Trạng thái</label>
              <select
                value={form.trangThai}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
              >
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đang ở">Đang ở</option>
                <option value="Đã trả">Đã trả</option>
              </select>
            </div>

            <div className="tv2-field">
              <label>Khách hàng</label>
              <select
                value={form.maKhachHang}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, maKhachHang: e.target.value })}
              >
                <option value="">-- Chọn khách hàng --</option>
                {dsKH.map((kh) => (
                  <option key={kh.maKhachHang} value={kh.maKhachHang}>
                    {kh.maKhachHang} - {kh.tenKhachHang}
                  </option>
                ))}
              </select>
            </div>

            <div className="tv2-field">
              <label>Phòng</label>
              <select
                value={form.maPhong}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, maPhong: e.target.value })}
              >
                <option value="">-- Chọn phòng --</option>
                {dsPhong.map((p) => (
                  <option key={p.maPhong} value={p.maPhong}>
                    {p.maPhong}
                    {p.soPhong ? ` - Phòng ${p.soPhong}` : ''}
                    {p.trangThai ? ` (${p.trangThai})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="tv2-field">
              <label>Ngày đặt thuê</label>
              <input
                type="date"
                value={form.ngayThue}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, ngayThue: e.target.value })}
              />
            </div>

            <div className="tv2-field">
              <label>Ngày nhận phòng</label>
              <input
                type="date"
                value={form.ngayNhan}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, ngayNhan: e.target.value })}
              />
            </div>

            <div className="tv2-field full">
              <label>Ngày trả phòng</label>
              <input
                type="date"
                value={form.ngayTra}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, ngayTra: e.target.value })}
              />
            </div>

            <div className="tv2-actions">
              <button
                className="tv2-btn tv2-btn-primary"
                onClick={xuLyThem}
                disabled={dangChon}
                title={dangChon ? 'Bấm Làm mới trước khi thêm phiếu mới' : ''}
              >
                <Plus size={15} /> Thêm phiếu
              </button>
              <button
                className="tv2-btn tv2-btn-amber"
                onClick={xuLySua}
                disabled={daTraPhong}
                title={daTraPhong ? 'Phiếu đã trả phòng, không thể sửa' : ''}
              >
                <Pencil size={15} /> Sửa
              </button>
              <button className="tv2-btn tv2-btn-danger" onClick={xuLyXoa}>
                <Trash2 size={15} /> Xóa
              </button>
              <button className="tv2-btn tv2-btn-ghost" onClick={taoMoiForm}>
                <RotateCcw size={15} /> Làm mới
              </button>
              {daTraPhong && (
                <span className="tv2-lock-note">Phiếu đã trả phòng, không thể chỉnh sửa</span>
              )}
            </div>
          </div>
        </div>

        {/* Khung Lọc theo khoảng thời gian */}
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <Filter size={18} color="#26596a" />
              <span>Tra cứu theo khoảng thời gian</span>
            </div>
          </div>

          <div className="tv2-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="tv2-field">
              <label>Ngày nhận phòng từ</label>
              <input
                type="date"
                value={boLocNgay.ngayBatDau}
                onChange={(e) => setBoLocNgay({ ...boLocNgay, ngayBatDau: e.target.value })}
              />
            </div>

            <div className="tv2-field">
              <label>Ngày trả phòng đến</label>
              <input
                type="date"
                value={boLocNgay.ngayKetThuc}
                onChange={(e) => setBoLocNgay({ ...boLocNgay, ngayKetThuc: e.target.value })}
              />
            </div>

            <div className="tv2-actions" style={{ marginTop: '8px' }}>
              <button className="tv2-btn tv2-btn-primary" onClick={locTheoThoiGian}>
                <Filter size={15} /> Lọc danh sách
              </button>
              <button className="tv2-btn tv2-btn-ghost" onClick={taiDSThuePhong}>
                Xem tất cả
              </button>
              <button
                className="tv2-btn tv2-btn-ghost"
                onClick={() => setBoLocNgay({ ngayBatDau: '', ngayKetThuc: '' })}
              >
                Xóa ngày
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách phiếu thuê */}
      <div className="tv2-card">
        <div className="tv2-card-header">
          <div className="tv2-header-title">
            <span>Danh sách phiếu thuê phòng</span>
            <span
              style={{
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {dsThue.length} phiếu
            </span>
          </div>
        </div>

        <div className="tv2-table-scroll">
          <table className="tv2-table">
            <thead>
              <tr>
                <th>Mã thuê</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Ngày thuê</th>
                <th>Ngày nhận</th>
                <th>Ngày trả</th>
                <th>Số ngày ở</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {dsThue.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: '#94a3b8' }}>
                    Không có phiếu thuê phòng nào phù hợp
                  </td>
                </tr>
              ) : (
                dsThue.map((tp) => (
                  <tr
                    key={tp.maThue}
                    className={dangChon && form.maThue === tp.maThue ? 'selected' : ''}
                    onClick={() => chonPhieuThue(tp)}
                  >
                    <td>
                      <span className="tv2-code-pill">{tp.maThue}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>
                        {tp.tenKhachHang || tp.maKhachHang}
                      </div>
                      {tp.tenKhachHang && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{tp.maKhachHang}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>
                        {tp.soPhong ? `Phòng ${tp.soPhong}` : tp.maPhong}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {tp.tenLoai ? `${tp.maPhong} • ${tp.tenLoai}` : tp.maPhong}
                      </div>
                    </td>
                    <td>{tp.ngayThue}</td>
                    <td>{tp.ngayNhan}</td>
                    <td>{tp.ngayTra}</td>
                    <td>
                      <span className="tv2-days-badge">{tp.soNgayLuuTru ?? 1} ngày</span>
                    </td>
                    <td>{renderBadgeTrangThai(tp.trangThai)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}