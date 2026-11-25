import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  Filter,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import { tv1Api, tv2Api } from '../../services/api';
import './ThuePhong.css';

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

const chuanHoa = (str = '') =>
  String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

const soSanhChuoi = (a = '', b = '') =>
  String(a || '').localeCompare(String(b || ''), 'vi', { numeric: true, sensitivity: 'base' });

export default function ThuePhongPage() {
  const [dsThue, setDsThue] = useState([]);
  const [dsKH, setDsKH] = useState([]);
  const [dsPhong, setDsPhong] = useState([]);
  const [form, setForm] = useState(FORM_MAC_DINH);
  const [dangChon, setDangChon] = useState(false);
  const [daTraPhong, setDaTraPhong] = useState(false);
  const [soNgayLuuTru, setSoNgayLuuTru] = useState(0);

  // Lọc theo Stored Procedure sp_DanhSachDatPhongTheoThoiGian
  const [boLocNgay, setBoLocNgay] = useState({
    ngayBatDau: '2026-11-01',
    ngayKetThuc: '2026-11-30',
  });
  const [dangLocThoiGian, setDangLocThoiGian] = useState(false);

  // Tìm kiếm + Sắp xếp trên bảng phiếu thuê
  const [tuKhoa, setTuKhoa] = useState('');
  const [sapXep, setSapXep] = useState({ truong: 'maThue', chieu: 'asc' });

  const [thongBao, setThongBao] = useState({ noiDung: '', loai: '' });

  const hienThongBao = (noiDung, loai = 'success') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao({ noiDung: '', loai: '' }), 3500);
  };

  const taiDSThuePhong = async () => {
    try {
      const res = await tv2Api.layDSThuePhong();
      setDsThue(tachMang(res));
      setDangLocThoiGian(false);
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

  const dsThueHienThi = useMemo(() => {
    const kw = chuanHoa(tuKhoa);
    const ketQua = !kw
      ? dsThue
      : dsThue.filter((tp) =>
          chuanHoa(
            `${tp.maThue || ''} ${tp.maKhachHang || ''} ${tp.tenKhachHang || ''} ${tp.soDienThoai || ''} ${tp.maPhong || ''} ${tp.soPhong || ''} ${tp.tenLoai || ''} ${tp.trangThai || ''} ${tp.ngayThue || ''} ${tp.ngayNhan || ''} ${tp.ngayTra || ''}`
          ).includes(kw)
        );

    const heSo = sapXep.chieu === 'asc' ? 1 : -1;
    return [...ketQua].sort((a, b) => {
      if (sapXep.truong === 'soNgayLuuTru') {
        return (Number(a.soNgayLuuTru ?? 0) - Number(b.soNgayLuuTru ?? 0)) * heSo;
      }
      return soSanhChuoi(a[sapXep.truong], b[sapXep.truong]) * heSo;
    });
  }, [dsThue, tuKhoa, sapXep]);

  const doiSapXepCot = (truong) => {
    setSapXep((prev) =>
      prev.truong === truong
        ? { truong, chieu: prev.chieu === 'asc' ? 'desc' : 'asc' }
        : { truong, chieu: 'asc' }
    );
  };

  const renderIconSort = (truong) => {
    if (sapXep.truong !== truong) return <ArrowUpDown size={13} className="tv2-sort-idle" />;
    return sapXep.chieu === 'asc' ? (
      <ArrowUp size={13} className="tv2-sort-active" />
    ) : (
      <ArrowDown size={13} className="tv2-sort-active" />
    );
  };

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
    if (dangChon) return;
    if (!form.maKhachHang.trim() || !form.maPhong.trim()) {
      hienThongBao('Vui lòng chọn đủ khách hàng và phòng', 'error');
      return;
    }
    if (!form.ngayThue || !form.ngayNhan || !form.ngayTra) {
      hienThongBao('Vui lòng chọn đầy đủ ngày thuê, ngày nhận và ngày trả', 'error');
      return;
    }
    if (form.ngayNhan < form.ngayThue) {
      hienThongBao('Ngày nhận phòng phải lớn hơn hoặc bằng ngày thuê', 'error');
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
    if (form.ngayNhan < form.ngayThue) {
      hienThongBao('Ngày nhận phòng phải lớn hơn hoặc bằng ngày thuê', 'error');
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
      setDangLocThoiGian(true);
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
      {thongBao.noiDung && (
        <div className={`tv2-toast ${thongBao.loai}`}>
          <span>{thongBao.noiDung}</span>
          <button
            type="button"
            className="tv2-clear-btn"
            style={{ position: 'static', color: 'inherit' }}
            onClick={() => setThongBao({ noiDung: '', loai: '' })}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ==================== HÀNG TRÊN: FORM + LỌC STORED PROCEDURE ==================== */}
      <div className="tv2-top-layout">
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <CalendarCheck size={18} color="#26596a" />
              <span>Thông tin phiếu thuê phòng</span>
            </div>
          </div>

          <div className="tv2-form-grid">
            <div className="tv2-field">
              <label>Mã phiếu thuê</label>
              <input type="text" value={form.maThue} placeholder="Tự động sinh" disabled />
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
                {dsPhong.map((p) => {
                  const dangSuDung = p.trangThai === 'Đang sử dụng' && p.maPhong !== form.maPhong;
                  const tenLoai = p.loaiPhong?.tenLoai || p.tenLoai || '';
                  return (
                    <option key={p.maPhong} value={p.maPhong} disabled={dangSuDung}>
                      Phòng {p.soPhong}
                      {tenLoai ? ` - ${tenLoai}` : ''} ({p.trangThai})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="tv2-field">
              <label>Ngày thuê</label>
              <input
                type="date"
                value={form.ngayThue}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, ngayThue: e.target.value })}
              />
            </div>

            <div className="tv2-field">
              <label>Số ngày lưu trú</label>
              <div className="tv2-stay-box">
                <span>Tự động tính</span>
                <span>{soNgayLuuTru} ngày</span>
              </div>
            </div>

            <div className="tv2-field">
              <label>Ngày nhận phòng</label>
              <input
                type="date"
                min={form.ngayThue || undefined}
                value={form.ngayNhan}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, ngayNhan: e.target.value })}
              />
            </div>

            <div className="tv2-field">
              <label>Ngày trả phòng</label>
              <input
                type="date"
                min={form.ngayNhan || form.ngayThue || undefined}
                value={form.ngayTra}
                disabled={daTraPhong}
                onChange={(e) => setForm({ ...form, ngayTra: e.target.value })}
              />
            </div>

            <div className="tv2-actions">
              <button
                type="button"
                className="tv2-btn tv2-btn-primary"
                onClick={xuLyThem}
                disabled={dangChon}
              >
                <Plus size={15} /> Thêm
              </button>
              <button
                type="button"
                className="tv2-btn tv2-btn-amber"
                onClick={xuLySua}
                disabled={!dangChon || daTraPhong}
              >
                <Pencil size={15} /> Sửa
              </button>
              <button
                type="button"
                className="tv2-btn tv2-btn-danger"
                onClick={xuLyXoa}
                disabled={!dangChon}
              >
                <Trash2 size={15} /> Xóa
              </button>
              <button type="button" className="tv2-btn tv2-btn-ghost" onClick={taoMoiForm}>
                <RotateCcw size={15} /> Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Khung lọc theo khoảng thời gian (Stored Procedure) */}
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <Filter size={17} color="#26596a" />
              <span>Tra cứu theo khoảng thời gian</span>
            </div>
          </div>

          <div className="tv2-filter-body">
            <div className="tv2-field">
              <label>Từ ngày</label>
              <input
                type="date"
                value={boLocNgay.ngayBatDau}
                onChange={(e) => setBoLocNgay({ ...boLocNgay, ngayBatDau: e.target.value })}
              />
            </div>

            <div className="tv2-field">
              <label>Đến ngày</label>
              <input
                type="date"
                value={boLocNgay.ngayKetThuc}
                onChange={(e) => setBoLocNgay({ ...boLocNgay, ngayKetThuc: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="tv2-btn tv2-btn-primary"
                style={{ flex: 1 }}
                onClick={locTheoThoiGian}
              >
                <Filter size={15} /> Lọc theo thời gian
              </button>
              <button type="button" className="tv2-btn tv2-btn-ghost" onClick={taiDSThuePhong}>
                <RotateCcw size={15} /> Tất cả
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== BẢNG DANH SÁCH + TÌM KIẾM + SẮP XẾP ==================== */}
      <div className="tv2-card">
        <div className="tv2-card-header">
          <div className="tv2-header-title">
            <Clock size={18} color="#26596a" />
            <span>Danh sách phiếu thuê phòng</span>
            <span className="tv2-count-badge">
              {tuKhoa.trim() ? `${dsThueHienThi.length} / ${dsThue.length}` : dsThue.length}
            </span>
            {dangLocThoiGian && (
              <span className="tv2-sp-tag">
                {boLocNgay.ngayBatDau} → {boLocNgay.ngayKetThuc}
              </span>
            )}
          </div>

          <div className="tv2-toolbar">
            <div className="tv2-search-wrap">
              <Search size={14} className="tv2-search-icon" />
              <input
                type="text"
                className="tv2-search-input"
                placeholder="Tìm mã thuê, khách, SĐT, phòng, trạng thái..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
              {tuKhoa && (
                <button
                  type="button"
                  className="tv2-clear-btn"
                  onClick={() => setTuKhoa('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className="tv2-select-sm"
              value={`${sapXep.truong}_${sapXep.chieu}`}
              onChange={(e) => {
                const [truong, chieu] = e.target.value.split('_');
                setSapXep({ truong, chieu });
              }}
              title="Sắp xếp danh sách phiếu thuê"
            >
              <option value="maThue_asc">Mã thuê: Tăng dần</option>
              <option value="maThue_desc">Mã thuê: Giảm dần</option>
              <option value="ngayThue_desc">Ngày thuê: Mới nhất</option>
              <option value="ngayThue_asc">Ngày thuê: Cũ nhất</option>
              <option value="ngayNhan_desc">Ngày nhận: Mới nhất</option>
              <option value="ngayNhan_asc">Ngày nhận: Cũ nhất</option>
              <option value="ngayTra_desc">Ngày trả: Mới nhất</option>
              <option value="ngayTra_asc">Ngày trả: Cũ nhất</option>
              <option value="soNgayLuuTru_desc">Số ngày: Nhiều → Ít</option>
              <option value="soNgayLuuTru_asc">Số ngày: Ít → Nhiều</option>
              <option value="tenKhachHang_asc">Khách hàng: A → Z</option>
              <option value="soPhong_asc">Số phòng: Tăng dần</option>
            </select>
          </div>
        </div>

        <div className="tv2-table-scroll">
          <table className="tv2-table">
            <thead>
              <tr>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('maThue')}>
                  <span className="tv2-th-inner">Mã thuê {renderIconSort('maThue')}</span>
                </th>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('tenKhachHang')}>
                  <span className="tv2-th-inner">Khách hàng {renderIconSort('tenKhachHang')}</span>
                </th>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('soPhong')}>
                  <span className="tv2-th-inner">Phòng {renderIconSort('soPhong')}</span>
                </th>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('ngayThue')}>
                  <span className="tv2-th-inner">Ngày thuê {renderIconSort('ngayThue')}</span>
                </th>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('ngayNhan')}>
                  <span className="tv2-th-inner">Ngày nhận {renderIconSort('ngayNhan')}</span>
                </th>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('ngayTra')}>
                  <span className="tv2-th-inner">Ngày trả {renderIconSort('ngayTra')}</span>
                </th>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('soNgayLuuTru')}>
                  <span className="tv2-th-inner">Số ngày {renderIconSort('soNgayLuuTru')}</span>
                </th>
                <th className="tv2-th-sort" onClick={() => doiSapXepCot('trangThai')}>
                  <span className="tv2-th-inner">Trạng thái {renderIconSort('trangThai')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {dsThueHienThi.length === 0 ? (
                <tr>
                  <td colSpan={8} className="tv2-empty">
                    Không tìm thấy phiếu thuê phòng phù hợp
                  </td>
                </tr>
              ) : (
                dsThueHienThi.map((tp) => (
                  <tr
                    key={tp.maThue}
                    className={form.maThue === tp.maThue ? 'selected' : ''}
                    onClick={() => chonPhieuThue(tp)}
                  >
                    <td>
                      <span className="tv2-code-pill">{tp.maThue}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tp.tenKhachHang}</div>
                      <div className="tv2-sub-text">
                        {tp.maKhachHang}
                        {tp.soDienThoai ? ` • ${tp.soDienThoai}` : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>Phòng {tp.soPhong}</div>
                      {tp.tenLoai && <div className="tv2-sub-text">{tp.tenLoai}</div>}
                    </td>
                    <td>{tp.ngayThue}</td>
                    <td>{tp.ngayNhan}</td>
                    <td>{tp.ngayTra}</td>
                    <td>
                      <span className="tv2-days-badge">
                        <Clock size={12} /> {tp.soNgayLuuTru} ngày
                      </span>
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