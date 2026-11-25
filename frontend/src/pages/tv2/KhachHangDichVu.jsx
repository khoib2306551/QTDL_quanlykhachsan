import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  Users,
  Sparkles,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { tv2Api } from '../../services/api';
import './KhachHangDichVu.css';

const KH_MAC_DINH = { maKhachHang: '', tenKhachHang: '', diaChi: '', soDienThoai: '' };
const DV_MAC_DINH = { maDichVu: '', tenDichVu: '', giaDichVu: '' };

const tachMang = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

const layThongBaoLoi = (err, macDinh) => {
  return err?.response?.data?.message || err?.response?.data?.error || macDinh;
};

const laLoiKhoaNgoai = (msg = '') => {
  const lower = msg.toLowerCase();
  return lower.includes('foreign key') || lower.includes('constraint');
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

const dinhDangTien = (gia) => {
  const so = Number(gia);
  if (Number.isNaN(so)) return '0 đ';
  return `${so.toLocaleString('vi-VN')} đ`;
};

export default function KhachHangDichVuPage() {
  const [dsKH, setDsKH] = useState([]);
  const [formKH, setFormKH] = useState(KH_MAC_DINH);
  const [dangChonKH, setDangChonKH] = useState(false);
  const [tuKhoaKH, setTuKhoaKH] = useState('');
  const [sapXepKH, setSapXepKH] = useState({ truong: 'maKhachHang', chieu: 'asc' });

  const [dsDV, setDsDV] = useState([]);
  const [formDV, setFormDV] = useState(DV_MAC_DINH);
  const [dangChonDV, setDangChonDV] = useState(false);
  const [tuKhoaDV, setTuKhoaDV] = useState('');
  const [sapXepDV, setSapXepDV] = useState({ truong: 'maDichVu', chieu: 'asc' });

  const [thongBao, setThongBao] = useState({ noiDung: '', loai: '' });

  const hienThongBao = (noiDung, loai = 'success') => {
    setThongBao({ noiDung, loai });
    setTimeout(() => setThongBao({ noiDung: '', loai: '' }), 3000);
  };

  const taiDSKhachHang = async () => {
    try {
      const res = await tv2Api.layDSKH('');
      setDsKH(tachMang(res));
    } catch (e) {
      console.error(e);
      hienThongBao(layThongBaoLoi(e, 'Không tải được danh sách khách hàng'), 'error');
    }
  };

  const taiDSDichVu = async () => {
    try {
      const res = await tv2Api.layDSDichVu('');
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

  const dsKHHienThi = useMemo(() => {
    const kw = chuanHoa(tuKhoaKH);
    const ketQua = !kw
      ? dsKH
      : dsKH.filter((kh) =>
          chuanHoa(`${kh.maKhachHang || ''} ${kh.tenKhachHang || ''} ${kh.diaChi || ''} ${kh.soDienThoai || ''}`).includes(kw)
        );

    const heSo = sapXepKH.chieu === 'asc' ? 1 : -1;
    return [...ketQua].sort((a, b) => soSanhChuoi(a[sapXepKH.truong], b[sapXepKH.truong]) * heSo);
  }, [dsKH, tuKhoaKH, sapXepKH]);

  const doiSapXepCotKH = (truong) => {
    setSapXepKH((prev) =>
      prev.truong === truong
        ? { truong, chieu: prev.chieu === 'asc' ? 'desc' : 'asc' }
        : { truong, chieu: 'asc' }
    );
  };

  const dsDVHienThi = useMemo(() => {
    const kw = chuanHoa(tuKhoaDV);
    const ketQua = !kw
      ? dsDV
      : dsDV.filter((dv) =>
          chuanHoa(`${dv.maDichVu || ''} ${dv.tenDichVu || ''} ${dv.giaDichVu ?? ''}`).includes(kw)
        );

    const heSo = sapXepDV.chieu === 'asc' ? 1 : -1;
    return [...ketQua].sort((a, b) => {
      if (sapXepDV.truong === 'giaDichVu') {
        return (Number(a.giaDichVu ?? 0) - Number(b.giaDichVu ?? 0)) * heSo;
      }
      return soSanhChuoi(a[sapXepDV.truong], b[sapXepDV.truong]) * heSo;
    });
  }, [dsDV, tuKhoaDV, sapXepDV]);

  const doiSapXepCotDV = (truong) => {
    setSapXepDV((prev) =>
      prev.truong === truong
        ? { truong, chieu: prev.chieu === 'asc' ? 'desc' : 'asc' }
        : { truong, chieu: 'asc' }
    );
  };

  const renderIconSort = (state, truong) => {
    if (state.truong !== truong) return <ArrowUpDown size={13} className="tv2-sort-idle" />;
    return state.chieu === 'asc' ? (
      <ArrowUp size={13} className="tv2-sort-active" />
    ) : (
      <ArrowDown size={13} className="tv2-sort-active" />
    );
  };

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
    if (dangChonKH) return;
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
      taiDSKhachHang();
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
      taiDSKhachHang();
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
      taiDSKhachHang();
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
    if (dangChonDV) return;
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
      taiDSDichVu();
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
      taiDSDichVu();
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
      taiDSDichVu();
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

      {/* ==================== PHẦN 1: KHÁCH HÀNG ==================== */}
      <div className="tv2-section">
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <Users size={18} color="#26596a" />
              <span>Danh sách khách hàng</span>
              <span className="tv2-count-badge">
                {tuKhoaKH.trim() ? `${dsKHHienThi.length} / ${dsKH.length}` : dsKH.length}
              </span>
            </div>

            <div className="tv2-toolbar">
              <div className="tv2-search-input-wrap">
                <Search size={14} className="tv2-search-icon" />
                <input
                  type="text"
                  className="tv2-search-input"
                  placeholder="Tìm mã, tên, địa chỉ, SĐT..."
                  value={tuKhoaKH}
                  onChange={(e) => setTuKhoaKH(e.target.value)}
                />
                {tuKhoaKH && (
                  <button
                    type="button"
                    className="tv2-clear-btn"
                    onClick={() => setTuKhoaKH('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                className="tv2-sort-select"
                value={`${sapXepKH.truong}_${sapXepKH.chieu}`}
                onChange={(e) => {
                  const [truong, chieu] = e.target.value.split('_');
                  setSapXepKH({ truong, chieu });
                }}
                title="Sắp xếp danh sách khách hàng"
              >
                <option value="maKhachHang_asc">Mã KH: Tăng dần</option>
                <option value="maKhachHang_desc">Mã KH: Giảm dần</option>
                <option value="tenKhachHang_asc">Họ tên: A → Z</option>
                <option value="tenKhachHang_desc">Họ tên: Z → A</option>
                <option value="diaChi_asc">Địa chỉ: A → Z</option>
                <option value="diaChi_desc">Địa chỉ: Z → A</option>
              </select>
            </div>
          </div>

          <div className="tv2-table-scroll">
            <table className="tv2-table">
              <thead>
                <tr>
                  <th className="tv2-th-sort" onClick={() => doiSapXepCotKH('maKhachHang')}>
                    <span className="tv2-th-inner">
                      Mã KH {renderIconSort(sapXepKH, 'maKhachHang')}
                    </span>
                  </th>
                  <th className="tv2-th-sort" onClick={() => doiSapXepCotKH('tenKhachHang')}>
                    <span className="tv2-th-inner">
                      Họ và tên {renderIconSort(sapXepKH, 'tenKhachHang')}
                    </span>
                  </th>
                  <th className="tv2-th-sort" onClick={() => doiSapXepCotKH('diaChi')}>
                    <span className="tv2-th-inner">
                      Địa chỉ {renderIconSort(sapXepKH, 'diaChi')}
                    </span>
                  </th>
                  <th className="tv2-th-sort" onClick={() => doiSapXepCotKH('soDienThoai')}>
                    <span className="tv2-th-inner">
                      Số điện thoại {renderIconSort(sapXepKH, 'soDienThoai')}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dsKHHienThi.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="tv2-empty">
                      Không tìm thấy khách hàng phù hợp
                    </td>
                  </tr>
                ) : (
                  dsKHHienThi.map((kh) => (
                    <tr
                      key={kh.maKhachHang}
                      className={formKH.maKhachHang === kh.maKhachHang ? 'selected' : ''}
                      onClick={() => chonKhachHang(kh)}
                    >
                      <td>
                        <span className="tv2-code-pill">{kh.maKhachHang}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{kh.tenKhachHang}</td>
                      <td>{kh.diaChi || '—'}</td>
                      <td>{kh.soDienThoai || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Thông tin khách hàng */}
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <span>Thông tin khách hàng</span>
            </div>
          </div>

          <div className="tv2-form-body">
            <div className="tv2-form-row-2">
              <div className="tv2-field">
                <label>Mã khách hàng</label>
                <input
                  type="text"
                  value={formKH.maKhachHang}
                  placeholder="Tự động sinh"
                  disabled
                />
              </div>
              <div className="tv2-field">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  placeholder="VD: 0901234567"
                  value={formKH.soDienThoai}
                  onChange={(e) => setFormKH({ ...formKH, soDienThoai: e.target.value })}
                />
              </div>
            </div>

            <div className="tv2-field">
              <label>Tên khách hàng</label>
              <input
                type="text"
                placeholder="Nhập họ và tên khách hàng"
                value={formKH.tenKhachHang}
                onChange={(e) => setFormKH({ ...formKH, tenKhachHang: e.target.value })}
              />
            </div>

            <div className="tv2-field">
              <label>Địa chỉ</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ liên hệ"
                value={formKH.diaChi}
                onChange={(e) => setFormKH({ ...formKH, diaChi: e.target.value })}
              />
            </div>

            <div className="tv2-actions">
              <button
                type="button"
                className="tv2-btn tv2-btn-primary"
                onClick={xuLyThemKH}
                disabled={dangChonKH}
              >
                <Plus size={15} /> Thêm
              </button>
              <button
                type="button"
                className="tv2-btn tv2-btn-amber"
                onClick={xuLySuaKH}
                disabled={!dangChonKH}
              >
                <Pencil size={15} /> Sửa
              </button>
              <button
                type="button"
                className="tv2-btn tv2-btn-danger"
                onClick={xuLyXoaKH}
                disabled={!dangChonKH}
              >
                <Trash2 size={15} /> Xóa
              </button>
              <button type="button" className="tv2-btn tv2-btn-ghost" onClick={resetKhachHang}>
                <RotateCcw size={15} /> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PHẦN 2: DỊCH VỤ ==================== */}
      <div className="tv2-section">
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <Sparkles size={18} color="#26596a" />
              <span>Danh mục dịch vụ</span>
              <span className="tv2-count-badge">
                {tuKhoaDV.trim() ? `${dsDVHienThi.length} / ${dsDV.length}` : dsDV.length}
              </span>
            </div>

            <div className="tv2-toolbar">
              <div className="tv2-search-input-wrap">
                <Search size={14} className="tv2-search-icon" />
                <input
                  type="text"
                  className="tv2-search-input"
                  placeholder="Tìm mã, tên dịch vụ, đơn giá..."
                  value={tuKhoaDV}
                  onChange={(e) => setTuKhoaDV(e.target.value)}
                />
                {tuKhoaDV && (
                  <button
                    type="button"
                    className="tv2-clear-btn"
                    onClick={() => setTuKhoaDV('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                className="tv2-sort-select"
                value={`${sapXepDV.truong}_${sapXepDV.chieu}`}
                onChange={(e) => {
                  const [truong, chieu] = e.target.value.split('_');
                  setSapXepDV({ truong, chieu });
                }}
                title="Sắp xếp danh mục dịch vụ"
              >
                <option value="maDichVu_asc">Mã DV: Tăng dần</option>
                <option value="maDichVu_desc">Mã DV: Giảm dần</option>
                <option value="tenDichVu_asc">Tên DV: A → Z</option>
                <option value="tenDichVu_desc">Tên DV: Z → A</option>
                <option value="giaDichVu_asc">Đơn giá: Thấp → Cao</option>
                <option value="giaDichVu_desc">Đơn giá: Cao → Thấp</option>
              </select>
            </div>
          </div>

          <div className="tv2-table-scroll">
            <table className="tv2-table">
              <thead>
                <tr>
                  <th className="tv2-th-sort" onClick={() => doiSapXepCotDV('maDichVu')}>
                    <span className="tv2-th-inner">
                      Mã DV {renderIconSort(sapXepDV, 'maDichVu')}
                    </span>
                  </th>
                  <th className="tv2-th-sort" onClick={() => doiSapXepCotDV('tenDichVu')}>
                    <span className="tv2-th-inner">
                      Tên dịch vụ {renderIconSort(sapXepDV, 'tenDichVu')}
                    </span>
                  </th>
                  <th
                    className="tv2-th-sort"
                    style={{ textAlign: 'right' }}
                    onClick={() => doiSapXepCotDV('giaDichVu')}
                  >
                    <span className="tv2-th-inner" style={{ justifyContent: 'flex-end' }}>
                      Đơn giá {renderIconSort(sapXepDV, 'giaDichVu')}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dsDVHienThi.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="tv2-empty">
                      Không tìm thấy dịch vụ phù hợp
                    </td>
                  </tr>
                ) : (
                  dsDVHienThi.map((dv) => (
                    <tr
                      key={dv.maDichVu}
                      className={formDV.maDichVu === dv.maDichVu ? 'selected' : ''}
                      onClick={() => chonDichVu(dv)}
                    >
                      <td>
                        <span className="tv2-code-pill">{dv.maDichVu}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{dv.tenDichVu}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="tv2-price-text">{dinhDangTien(dv.giaDichVu)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Thông tin dịch vụ */}
        <div className="tv2-card">
          <div className="tv2-card-header">
            <div className="tv2-header-title">
              <span>Thông tin dịch vụ</span>
            </div>
          </div>

          <div className="tv2-form-body">
            <div className="tv2-form-row-2">
              <div className="tv2-field">
                <label>Mã dịch vụ</label>
                <input
                  type="text"
                  value={formDV.maDichVu}
                  placeholder="Tự động sinh"
                  disabled
                />
              </div>
              <div className="tv2-field">
                <label>Đơn giá (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="VD: 150000"
                  value={formDV.giaDichVu}
                  onChange={(e) => setFormDV({ ...formDV, giaDichVu: e.target.value })}
                />
              </div>
            </div>

            <div className="tv2-field">
              <label>Tên dịch vụ</label>
              <input
                type="text"
                placeholder="Nhập tên dịch vụ"
                value={formDV.tenDichVu}
                onChange={(e) => setFormDV({ ...formDV, tenDichVu: e.target.value })}
              />
            </div>

            <div className="tv2-actions">
              <button
                type="button"
                className="tv2-btn tv2-btn-primary"
                onClick={xuLyThemDV}
                disabled={dangChonDV}
              >
                <Plus size={15} /> Thêm
              </button>
              <button
                type="button"
                className="tv2-btn tv2-btn-amber"
                onClick={xuLySuaDV}
                disabled={!dangChonDV}
              >
                <Pencil size={15} /> Sửa
              </button>
              <button
                type="button"
                className="tv2-btn tv2-btn-danger"
                onClick={xuLyXoaDV}
                disabled={!dangChonDV}
              >
                <Trash2 size={15} /> Xóa
              </button>
              <button type="button" className="tv2-btn tv2-btn-ghost" onClick={resetDichVu}>
                <RotateCcw size={15} /> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}