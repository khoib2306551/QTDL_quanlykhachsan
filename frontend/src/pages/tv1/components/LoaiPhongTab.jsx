import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Save,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  FilterX,
} from 'lucide-react';
import { tv1Api } from '../../../services/api';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const INITIAL_FORM = {
  maLoai: '',
  tenLoai: '',
  giaPhong: '',
  moTa: '',
};

const INITIAL_FILTERS = {
  keyword: '',
  giaTu: '',
  giaDen: '',
  chiConPhongTrong: false,
};

export default function LoaiPhongTab({ onError, onDataChanged }) {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [filterInputs, setFilterInputs] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchLoaiPhong = useCallback(
    async (page = 1, filters = INITIAL_FILTERS) => {
      setLoading(true);
      try {
        const res = await tv1Api.layDSLoaiPhong({
          page,
          size: pageSize,
          keyword: filters.keyword,
          giaTu: filters.giaTu,
          giaDen: filters.giaDen,
          chiConPhongTrong: filters.chiConPhongTrong,
        });
        const raw = res.data?.data ?? res.data;

        if (Array.isArray(raw)) {
          setList(raw);
          setTotalElements(raw.length);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          setList(raw?.content || []);
          setCurrentPage(raw?.currentPage || page);
          setTotalPages(Math.max(raw?.totalPages || 1, 1));
          setTotalElements(raw?.totalElements || 0);
        }
      } catch (err) {
        onError(err, 'Không thể tải danh sách loại phòng.', setNotice);
      } finally {
        setLoading(false);
      }
    },
    [onError, pageSize]
  );

  useEffect(() => {
    fetchLoaiPhong(currentPage, appliedFilters);
  }, [fetchLoaiPhong, currentPage, appliedFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilterInputs((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setNotice({ type: '', text: '' });

    if (
      filterInputs.giaTu !== '' &&
      filterInputs.giaDen !== '' &&
      Number(filterInputs.giaTu) > Number(filterInputs.giaDen)
    ) {
      setNotice({ type: 'error', text: 'Giá từ không được lớn hơn giá đến.' });
      return;
    }

    const nextFilters = { ...filterInputs };
    setAppliedFilters(nextFilters);
    if (currentPage === 1) {
      fetchLoaiPhong(1, nextFilters);
    } else {
      setCurrentPage(1);
    }
  };

  const handleClearFilter = () => {
    setNotice({ type: '', text: '' });
    setFilterInputs(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    if (currentPage === 1) {
      fetchLoaiPhong(1, INITIAL_FILTERS);
    } else {
      setCurrentPage(1);
    }
  };

  const hasActiveFilter =
    appliedFilters.keyword.trim() !== '' ||
    appliedFilters.giaTu !== '' ||
    appliedFilters.giaDen !== '' ||
    appliedFilters.chiConPhongTrong;

  const handleSelectRow = (item) => {
    setNotice({ type: '', text: '' });
    setIsEditing(true);
    setFormData({
      maLoai: item.maLoai || '',
      tenLoai: item.tenLoai || '',
      giaPhong: item.giaPhong ?? '',
      moTa: item.moTa || '',
    });
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setIsEditing(false);
    setNotice({ type: '', text: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setNotice({ type: '', text: '' });

    if (!formData.tenLoai.trim() || formData.giaPhong === '') {
      setNotice({ type: 'error', text: 'Vui lòng nhập Tên loại phòng và Đơn giá.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tenLoai: formData.tenLoai.trim(),
        giaPhong: Number(formData.giaPhong),
        moTa: formData.moTa.trim() || null,
      };
      await tv1Api.themLoaiPhong(payload);
      setNotice({ type: 'success', text: 'Thêm loại phòng thành công!' });
      setFormData(INITIAL_FORM);
      await fetchLoaiPhong(1, appliedFilters);
      onDataChanged?.();
    } catch (err) {
      onError(err, 'Thêm loại phòng thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!isEditing || !formData.maLoai) return;
    setNotice({ type: '', text: '' });

    if (!formData.tenLoai.trim() || formData.giaPhong === '') {
      setNotice({ type: 'error', text: 'Tên loại phòng và Đơn giá không được để trống.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tenLoai: formData.tenLoai.trim(),
        giaPhong: Number(formData.giaPhong),
        moTa: formData.moTa.trim() || null,
      };
      await tv1Api.suaLoaiPhong(formData.maLoai, payload);
      setNotice({ type: 'success', text: `Cập nhật loại phòng ${formData.maLoai} thành công!` });
      await fetchLoaiPhong(currentPage, appliedFilters);
      onDataChanged?.();
    } catch (err) {
      onError(err, 'Cập nhật loại phòng thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setNotice({ type: '', text: '' });
    try {
      const deletedId = deleteTarget.maLoai;
      await tv1Api.xoaLoaiPhong(deletedId);
      const nextPage = list.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setDeleteTarget(null);
      handleReset();
      setNotice({ type: 'success', text: `Đã xóa loại phòng ${deletedId}.` });
      await fetchLoaiPhong(nextPage, appliedFilters);
      onDataChanged?.();
    } catch (err) {
      setDeleteTarget(null);
      onError(err, 'Xóa loại phòng thất bại (có thể đang có phòng thuộc loại này).', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card-box">
        <div className="card-title">
          {isEditing ? `Cập nhật loại phòng (${formData.maLoai})` : 'Thông tin loại phòng'}
        </div>

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

        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            <div>
              <div className="form-row">
                <label>Mã loại phòng:</label>
                <input
                  type="text"
                  name="maLoai"
                  value={formData.maLoai}
                  placeholder="Tự động sinh khi thêm mới"
                  disabled
                  className="cursor-not-allowed bg-slate-100 text-slate-500"
                />
              </div>

              <div className="form-row">
                <label>Tên loại (*):</label>
                <input
                  type="text"
                  name="tenLoai"
                  value={formData.tenLoai}
                  onChange={handleChange}
                  placeholder="VD: Phòng Đơn, Phòng Đôi, VIP..."
                />
              </div>
            </div>

            <div>
              <div className="form-row">
                <label>Đơn giá (VNĐ) (*):</label>
                <input
                  type="number"
                  name="giaPhong"
                  min="0"
                  step="1000"
                  value={formData.giaPhong}
                  onChange={handleChange}
                  placeholder="VD: 500000"
                />
              </div>

              <div className="form-row">
                <label>Mô tả:</label>
                <input
                  type="text"
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleChange}
                  placeholder="Tiện nghi, diện tích, số giường..."
                />
              </div>
            </div>
          </div>

          <div className="btn-group">
            <button
              type="submit"
              className="btn inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isEditing || submitting}
            >
              <Plus size={15} /> Thêm mới
            </button>

            <button
              type="button"
              className="btn btn-warning inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleUpdate}
              disabled={!isEditing || submitting}
            >
              <Save size={15} /> Lưu cập nhật
            </button>

            <button
              type="button"
              className="btn btn-danger inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => isEditing && setDeleteTarget(formData)}
              disabled={!isEditing || submitting}
            >
              <Trash2 size={15} /> Xóa
            </button>

            <button
              type="button"
              className="btn btn-secondary inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleReset}
              disabled={submitting}
            >
              <RotateCcw size={15} /> Làm mới
            </button>
          </div>
        </form>
      </div>

      <div className="card-box">
        <div className="card-title">Danh sách loại phòng ({totalElements})</div>

        <form
          onSubmit={handleApplyFilter}
          className="mb-3 grid grid-cols-1 items-center gap-2 rounded-[3px] border border-slate-200 bg-slate-50 p-2.5 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input
            type="text"
            name="keyword"
            value={filterInputs.keyword}
            onChange={handleFilterInputChange}
            placeholder="Tìm tên hoặc mô tả loại phòng..."
            className="rounded-[3px] border border-slate-400 bg-white px-2.5 py-1.5 text-[13px]"
          />

          <input
            type="number"
            name="giaTu"
            min="0"
            value={filterInputs.giaTu}
            onChange={handleFilterInputChange}
            placeholder="Giá từ (đ)..."
            className="rounded-[3px] border border-slate-400 bg-white px-2.5 py-1.5 text-[13px]"
          />

          <input
            type="number"
            name="giaDen"
            min="0"
            value={filterInputs.giaDen}
            onChange={handleFilterInputChange}
            placeholder="Giá đến (đ)..."
            className="rounded-[3px] border border-slate-400 bg-white px-2.5 py-1.5 text-[13px]"
          />

          <label className="inline-flex cursor-pointer items-center gap-2 px-1 text-[13px] font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              name="chiConPhongTrong"
              checked={filterInputs.chiConPhongTrong}
              onChange={handleFilterInputChange}
              className="h-4 w-4 accent-[#26596a]"
            />
            Chỉ loại còn phòng trống
          </label>

          <div className="flex gap-1.5">
            <button
              type="submit"
              disabled={loading}
              className="btn inline-flex flex-1 items-center justify-center gap-1 disabled:opacity-50"
            >
              <Search size={14} /> Lọc
            </button>

            {hasActiveFilter && (
              <button
                type="button"
                disabled={loading}
                onClick={handleClearFilter}
                title="Xóa bộ lọc"
                className="btn btn-secondary inline-flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <FilterX size={14} /> Xóa lọc
              </button>
            )}
          </div>
        </form>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[140px]">Mã loại</th>
                <th className="w-[220px]">Tên loại phòng</th>
                <th className="w-[160px]">Đơn giá</th>
                <th className="w-[160px]">Phòng trống / Tổng</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    {hasActiveFilter
                      ? 'Không tìm thấy loại phòng phù hợp với điều kiện lọc.'
                      : 'Chưa có dữ liệu loại phòng.'}
                  </td>
                </tr>
              ) : (
                list.map((item) => {
                  const isSelected = isEditing && formData.maLoai === item.maLoai;
                  const price = item.giaPhong ?? 0;
                  const trong = item.soPhongTrong ?? 0;
                  const tong = item.tongSoPhong ?? 0;
                  return (
                    <tr
                      key={item.maLoai}
                      onClick={() => handleSelectRow(item)}
                      className={isSelected ? 'bg-sky-200 font-semibold' : ''}
                    >
                      <td>{item.maLoai}</td>
                      <td>{item.tenLoai}</td>
                      <td>{Number(price).toLocaleString('vi-VN')} đ</td>
                      <td>
                        <span
                          className={`inline-block rounded-[3px] px-2 py-0.5 text-xs font-semibold ${
                            trong > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {trong} / {tong}
                        </span>
                      </td>
                      <td>{item.moTa || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-[13px]">
          <div>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (Tổng:{' '}
            <strong>{totalElements}</strong> loại phòng)
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
        title="XÁC NHẬN XÓA LOẠI PHÒNG"
        itemName={deleteTarget?.tenLoai}
        itemCode={deleteTarget?.maLoai}
        submitting={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}