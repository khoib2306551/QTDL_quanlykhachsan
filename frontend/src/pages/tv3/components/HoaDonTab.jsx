import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { tv3Api, tv2Api } from '../../../services/api';
import ConfirmDeleteModal from '../../tv1/components/ConfirmDeleteModal';

const PAGE_SIZE = 10;

const formatDate = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
const formatMoney = (n) => `${Number(n ?? 0).toLocaleString('vi-VN')} đ`;
const homNay = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function HoaDonTab({ onError }) {
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ maThue: '', ngayLapHoaDon: homNay() });
  const [thueList, setThueList] = useState([]);
  const [preview, setPreview] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tv3Api.layDSHoaDon(search, PAGE_SIZE, currentPage);
      const raw = res.data?.data ?? res.data;
      setList(raw?.content || []);
      setTotalPages(Math.max(raw?.totalPages || 1, 1));
      setTotalElements(raw?.totalElements || 0);
    } catch (err) {
      onError(err, 'Không thể tải danh sách hóa đơn.', setNotice);
    } finally {
      setLoading(false);
    }
  }, [onError, search, currentPage]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    (async () => {
      try {
        const res = await tv2Api.layDSThuePhong();
        setThueList(res.data || []);
      } catch (err) {
        onError(err, 'Không thể tải danh sách phiếu thuê.', setNotice);
      }
    })();
  }, [onError]);

  const handleSearch = (e) => {
    e.preventDefault();
    setNotice({ type: '', text: '' });
    setCurrentPage(1);
    setSearch(keyword.trim());
  };

  const handleReset = () => {
    setNotice({ type: '', text: '' });
    setKeyword('');
    setSearch('');
    setCurrentPage(1);
  };

  const handleSelect = async (item) => {
    setSelected(item);
    setDetails([]);
    if (!item.maThue) return;
    setDetailLoading(true);
    try {
      const res = await tv3Api.layDichVuTheoThue(item.maThue);
      setDetails(res.data?.data ?? res.data ?? []);
    } catch (err) {
      onError(err, 'Không thể tải chi tiết dịch vụ.', setNotice);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChonThue = async (maThue) => {
    const tp = thueList.find((t) => t.maThue === maThue);
    setForm((f) => ({ ...f, maThue, ngayLapHoaDon: tp?.ngayTra ?? homNay() }));
    setPreview(null);
    if (!maThue) return;
    try {
      const res = await tv3Api.tinhTongTien(maThue);
      setPreview(res.data);
    } catch (err) {
      onError(err, 'Không thể tính tạm tổng tiền.', setNotice);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setNotice({ type: '', text: '' });
    setSubmitting(true);
    try {
      await tv3Api.themHoaDon(form);
      setNotice({ type: 'success', text: `Đã lập hóa đơn cho phiếu thuê ${form.maThue}.` });
      setForm({ maThue: '', ngayLapHoaDon: homNay() });
      setPreview(null);
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchList();
      }
    } catch (err) {
      onError(err, 'Lập hóa đơn thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ma = deleteTarget.maHoaDon;
    setSubmitting(true);
    setNotice({ type: '', text: '' });
    try {
      await tv3Api.xoaHoaDon(ma);
      setDeleteTarget(null);
      if (selected?.maHoaDon === ma) setSelected(null);
      setNotice({ type: 'success', text: `Đã xóa hóa đơn ${ma}.` });
      if (list.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchList();
      }
    } catch (err) {
      setDeleteTarget(null);
      onError(err, 'Xóa hóa đơn thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const ngayTraChon = thueList.find((t) => t.maThue === form.maThue)?.ngayTra;

  return (
    <div>
      <div className="card-box">
        <div className="card-title">Lập hóa đơn</div>

        <form onSubmit={handleCreate}>
          <div className="form-row">
            <label>Phiếu thuê:</label>
            <select value={form.maThue} onChange={(e) => handleChonThue(e.target.value)}>
              <option value="">-- Chọn phiếu thuê --</option>
              {thueList.map((t) => (
                <option key={t.maThue} value={t.maThue}>
                  {t.maThue} — {t.tenKhachHang} (phòng {t.soPhong})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Ngày lập (= ngày trả):</label>
            <input
              type="date"
              value={form.ngayLapHoaDon}
              min={ngayTraChon}
              max={ngayTraChon}
              onChange={(e) => setForm({ ...form, ngayLapHoaDon: e.target.value })}
            />
          </div>

          {preview && (
            <div className="form-row">
              <label>Tạm tính:</label>
              <div className="text-[13px]">
                Tiền phòng <strong>{formatMoney(preview.tienPhong)}</strong> + Dịch vụ{' '}
                <strong>{formatMoney(preview.tienDichVu)}</strong> ={' '}
                <strong>{formatMoney(preview.tongTien)}</strong>
              </div>
            </div>
          )}

          <div className="btn-group">
            <button
              type="submit"
              className="btn inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting || !form.maThue}
            >
              <Plus size={15} /> Lập hóa đơn
            </button>
          </div>
        </form>
      </div>
      <div className="card-box">
        <div className="card-title">Tìm kiếm hóa đơn</div>

        {notice.text && (
          <div
            className={`mb-3 rounded-[3px] border px-3 py-2 text-[13px] font-semibold ${
              notice.type === 'error'
                ? 'border-red-300 bg-red-100 text-red-700'
                : 'border-green-300 bg-green-100 text-green-700'
            }`}
          >
            {notice.text}
          </div>
        )}

        <form onSubmit={handleSearch}>
          <div className="form-row">
            <label>Mã hóa đơn:</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="VD: HD01"
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn inline-flex items-center gap-1.5">
              <Search size={15} /> Tìm kiếm
            </button>
            <button
              type="button"
              className="btn btn-secondary inline-flex items-center gap-1.5"
              onClick={handleReset}
            >
              <RotateCcw size={15} /> Làm mới
            </button>
          </div>
        </form>
      </div>

      <div className="card-box">
        <div className="card-title">Danh sách hóa đơn ({totalElements})</div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Mã thuê</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Số ngày</th>
                <th>Tiền phòng</th>
                <th>Tiền dịch vụ</th>
                <th>Tổng tiền</th>
                <th>Ngày lập</th>
                <th className="w-[110px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-4 text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-4 text-center text-slate-500">
                    Không có hóa đơn nào.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr
                    key={item.maHoaDon}
                    onClick={() => handleSelect(item)}
                    className={`cursor-pointer ${
                      selected?.maHoaDon === item.maHoaDon ? 'bg-amber-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td>{item.maHoaDon}</td>
                    <td>{item.maThue ?? '—'}</td>
                    <td>{item.tenKhachHang ?? '—'}</td>
                    <td>{item.soPhong ?? '—'}</td>
                    <td>{item.soNgay ?? '—'}</td>
                    <td>{item.tienPhong == null ? '—' : formatMoney(item.tienPhong)}</td>
                    <td>{item.tienDichVu == null ? '—' : formatMoney(item.tienDichVu)}</td>
                    <td className="font-bold">{formatMoney(item.tongTien)}</td>
                    <td>{formatDate(item.ngayLapHoaDon)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger inline-flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-[13px]">
          <div>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (Tổng:{' '}
            <strong>{totalElements}</strong> hóa đơn)
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              className="btn btn-secondary inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <button
              type="button"
              className="btn btn-secondary inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="card-box">
          <div className="card-title">
            Chi tiết dịch vụ — hóa đơn {selected.maHoaDon} (phiếu thuê {selected.maThue ?? '—'})
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã SDDV</th>
                  <th>Dịch vụ</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Ngày dùng</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {detailLoading ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center">Đang tải dữ liệu...</td>
                  </tr>
                ) : details.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-500">
                      {selected.maThue
                        ? 'Phiếu thuê này chưa sử dụng dịch vụ nào.'
                        : 'Hóa đơn này không còn liên kết với phiếu thuê.'}
                    </td>
                  </tr>
                ) : (
                  details.map((d) => (
                    <tr key={d.maSddv}>
                      <td>{d.maSddv}</td>
                      <td>{d.tenDichVu}</td>
                      <td>{formatMoney(d.donGia)}</td>
                      <td>{d.soLuong}</td>
                      <td>{formatDate(d.ngaySuDung)}</td>
                      <td>{formatMoney(d.thanhTien)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-right text-[13px]">
            Tiền phòng <strong>{formatMoney(selected.tienPhong)}</strong> + Dịch vụ{' '}
            <strong>{formatMoney(selected.tienDichVu)}</strong> ={' '}
            <strong>{formatMoney(selected.tongTien)}</strong>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="XÁC NHẬN XÓA HÓA ĐƠN"
        itemName={`Hóa đơn ${deleteTarget?.maHoaDon}`}
        itemCode={`ngày lập ${formatDate(deleteTarget?.ngayLapHoaDon)}`}
        submitting={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}