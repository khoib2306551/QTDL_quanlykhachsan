import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, Trash2, ChevronLeft, ChevronRight, Plus, Pencil, Save, X } from 'lucide-react';
import { tv3Api, tv2Api } from '../../../services/api';
import ConfirmDeleteModal from '../../tv1/components/ConfirmDeleteModal';

const PAGE_SIZE = 10;

const formatDate = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
const formatMoney = (n) => `${Number(n ?? 0).toLocaleString('vi-VN')} đ`;
const EMPTY_FORM = { maThue: '', maDichVu: '', soLuong: 1, ngaySuDung: '' };

export default function SddvTab({ onError }) {
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
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [thueList, setThueList] = useState([]);
  const [dichVuList, setDichVuList] = useState([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tv3Api.layDSSDDV(search, PAGE_SIZE, currentPage);
      const raw = res.data?.data ?? res.data;
      setList(raw?.content || []);
      setTotalPages(Math.max(raw?.totalPages || 1, 1));
      setTotalElements(raw?.totalElements || 0);
    } catch (err) {
      onError(err, 'Không thể tải danh sách sử dụng dịch vụ.', setNotice);
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
        const [t, d] = await Promise.all([tv2Api.layDSThuePhong(), tv2Api.layDSDichVu()]);
        setThueList(t.data || []);
        setDichVuList(d.data || []);
      } catch (err) {
        onError(err, 'Không thể tải danh sách phiếu thuê / dịch vụ.', setNotice);
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

  const handleCancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (item) => {
    setNotice({ type: '', text: '' });
    setEditing(item.maSddv);
    setForm({
      maThue: item.maThue,
      maDichVu: item.maDichVu,
      soLuong: item.soLuong,
      ngaySuDung: item.ngaySuDung,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: '', text: '' });
    setSubmitting(true);
    try {
      const payload = { ...form, soLuong: Number(form.soLuong) };
      if (editing) {
        await tv3Api.suaSDDV(editing, payload);
        setNotice({ type: 'success', text: `Đã cập nhật lượt sử dụng dịch vụ ${editing}.` });
      } else {
        await tv3Api.themSDDV(payload);
        setNotice({ type: 'success', text: 'Đã thêm lượt sử dụng dịch vụ.' });
      }
      handleCancelEdit();
      fetchList();
    } catch (err) {
      onError(err, editing ? 'Cập nhật thất bại.' : 'Thêm thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ma = deleteTarget.maSddv;
    setSubmitting(true);
    setNotice({ type: '', text: '' });
    try {
      await tv3Api.xoaSDDV(ma);
      if (editing === ma) handleCancelEdit();
      setDeleteTarget(null);
      setNotice({ type: 'success', text: `Đã xóa lượt sử dụng dịch vụ ${ma}.` });
      if (list.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchList();
      }
    } catch (err) {
      setDeleteTarget(null);
      onError(err, 'Xóa lượt sử dụng dịch vụ thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card-box">
        <div className="card-title">
          {editing ? `Sửa lượt sử dụng dịch vụ ${editing}` : 'Thêm sử dụng dịch vụ'}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Phiếu thuê:</label>
            <select
              value={form.maThue}
              disabled={Boolean(editing)}
              onChange={(e) => setForm({ ...form, maThue: e.target.value })}
            >
              <option value="">-- Chọn phiếu thuê --</option>
              {thueList.map((t) => (
                <option key={t.maThue} value={t.maThue}>
                  {t.maThue} — {t.tenKhachHang} (phòng {t.soPhong})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Dịch vụ:</label>
            <select
              value={form.maDichVu}
              onChange={(e) => setForm({ ...form, maDichVu: e.target.value })}
            >
              <option value="">-- Chọn dịch vụ --</option>
              {dichVuList.map((d) => (
                <option key={d.maDichVu} value={d.maDichVu}>
                  {d.tenDichVu} — {formatMoney(d.giaDichVu)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Số lượng:</label>
            <input
              type="number"
              min="1"
              value={form.soLuong}
              onChange={(e) => setForm({ ...form, soLuong: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label>Ngày sử dụng:</label>
            <input
              type="date"
              value={form.ngaySuDung}
              onChange={(e) => setForm({ ...form, ngaySuDung: e.target.value })}
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn inline-flex items-center gap-1.5" disabled={submitting}>
              {editing ? <><Save size={15} /> Lưu</> : <><Plus size={15} /> Thêm</>}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-secondary inline-flex items-center gap-1.5"
                onClick={handleCancelEdit}
              >
                <X size={15} /> Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card-box">
        <div className="card-title">Tìm kiếm sử dụng dịch vụ</div>

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
            <label>Mã SDDV:</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="VD: SD01"
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
        <div className="card-title">Danh sách sử dụng dịch vụ ({totalElements})</div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã SDDV</th>
                <th>Mã thuê</th>
                <th>Số phòng</th>
                <th>Dịch vụ</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
                <th>Ngày sử dụng</th>
                <th className="w-[200px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-4 text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-slate-500">
                    Không có lượt sử dụng dịch vụ nào.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.maSddv}>
                    <td>{item.maSddv}</td>
                    <td>{item.maThue}</td>
                    <td>{item.soPhong}</td>
                    <td>{item.tenDichVu}</td>
                    <td>{item.soLuong}</td>
                    <td>{formatMoney(item.donGia)}</td>
                    <td>{formatMoney(item.thanhTien)}</td>
                    <td>{formatDate(item.ngaySuDung)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn inline-flex items-center gap-1 mr-1.5"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil size={14} /> Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger inline-flex items-center gap-1"
                        onClick={() => setDeleteTarget(item)}
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
            <strong>{totalElements}</strong> lượt sử dụng)
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

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="XÁC NHẬN XÓA SỬ DỤNG DỊCH VỤ"
        itemName={`${deleteTarget?.tenDichVu} (phòng ${deleteTarget?.soPhong})`}
        itemCode={deleteTarget?.maSddv}
        submitting={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}