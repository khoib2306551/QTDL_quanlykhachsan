import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Trash2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { tv1Api } from '../../../services/api';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const INITIAL_FORM = {
  maPhong: '',
  soPhong: '',
  maLoai: '',
  trangThai: 'Trống',
};

const TRANG_THAI_OPTIONS = [
  { value: 'Trống', label: 'Trống', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'Đang sử dụng', label: 'Đang sử dụng', badgeClass: 'bg-red-100 text-red-700' },
];

export default function PhongTab({ loaiPhongList, onError }) {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPhong = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await tv1Api.layDSPhong(pageSize, page);
        const raw = res.data?.data ?? res.data;

        setList(raw?.content || []);
        setCurrentPage(raw?.currentPage || page);
        setTotalPages(Math.max(raw?.totalPages || 1, 1));
        setTotalElements(raw?.totalElements || 0);
      } catch (err) {
        onError(err, 'Không thể tải danh sách phòng.', setNotice);
      } finally {
        setLoading(false);
      }
    },
    [onError, pageSize]
  );

  useEffect(() => {
    fetchPhong(currentPage);
  }, [fetchPhong, currentPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectRow = async (item) => {
    setNotice({ type: '', text: '' });
    try {
      const res = await tv1Api.chiTietPhong(item.maPhong);
      const detail = res.data?.data ?? res.data;

      const selected = {
        maPhong: detail.maPhong || '',
        soPhong: detail.soPhong || '',
        maLoai: detail.loaiPhong?.maLoai || '',
        trangThai: detail.trangThai || 'Trống',
      };

      setIsEditing(true);
      setFormData(selected);
      setOriginalData(selected);
    } catch (err) {
      onError(err, 'Không thể tải chi tiết phòng.', setNotice);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setOriginalData(null);
    setIsEditing(false);
    setNotice({ type: '', text: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setNotice({ type: '', text: '' });

    if (!formData.soPhong.trim() || !formData.maLoai) {
      setNotice({ type: 'error', text: 'Vui lòng nhập Số phòng và chọn Loại phòng.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        soPhong: formData.soPhong.trim(),
        maLoai: formData.maLoai,
        trangThai: formData.trangThai,
      };
      await tv1Api.themPhong(payload);
      setNotice({ type: 'success', text: 'Thêm phòng thành công!' });
      setFormData(INITIAL_FORM);
      fetchPhong(1);
    } catch (err) {
      onError(err, 'Thêm phòng thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!isEditing || !formData.maPhong) return;
    setNotice({ type: '', text: '' });

    const trimmedSoPhong = formData.soPhong.trim();
    if (!trimmedSoPhong || !formData.maLoai) {
      setNotice({ type: 'error', text: 'Số phòng và Loại phòng không được để trống.' });
      return;
    }

    const isStatusChanged = !originalData || formData.trangThai !== originalData.trangThai;
    const isOtherChanged =
      !originalData ||
      trimmedSoPhong !== originalData.soPhong ||
      formData.maLoai !== originalData.maLoai;

    setSubmitting(true);
    try {
      const payload = {
        soPhong: trimmedSoPhong,
        maLoai: formData.maLoai,
        // Chỉ gửi trangThai khi người dùng đổi trạng thái, hoặc không sửa bất kỳ trường nào
        ...(isStatusChanged || !isOtherChanged ? { trangThai: formData.trangThai } : {}),
      };

      await tv1Api.suaPhong(formData.maPhong, payload);
      setOriginalData({
        maPhong: formData.maPhong,
        soPhong: trimmedSoPhong,
        maLoai: formData.maLoai,
        trangThai: formData.trangThai,
      });
      setNotice({ type: 'success', text: `Cập nhật phòng ${trimmedSoPhong} thành công!` });
      fetchPhong(currentPage);
    } catch (err) {
      onError(err, 'Cập nhật phòng thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setNotice({ type: '', text: '' });
    try {
      const deletedId = deleteTarget.maPhong;
      const deletedName = deleteTarget.soPhong;
      await tv1Api.xoaPhong(deletedId);

      const nextPage = list.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setDeleteTarget(null);
      handleReset();
      setNotice({ type: 'success', text: `Đã xóa phòng ${deletedName} (${deletedId}).` });
      fetchPhong(nextPage);
    } catch (err) {
      setDeleteTarget(null);
      onError(err, 'Xóa phòng thất bại.', setNotice);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    const found = TRANG_THAI_OPTIONS.find((s) => s.value === status) || {
      label: status || 'Trống',
      badgeClass: 'bg-slate-200 text-slate-700',
    };
    return (
      <span className={`inline-block rounded-[3px] px-2 py-0.5 text-xs font-semibold ${found.badgeClass}`}>
        {found.label}
      </span>
    );
  };

  return (
    <div>
      <div className="card-box">
        <div className="card-title">
          {isEditing ? `Cập nhật thông tin phòng (${formData.maPhong})` : 'Thông tin phòng'}
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
                <label>Mã phòng:</label>
                <input
                  type="text"
                  name="maPhong"
                  value={formData.maPhong}
                  placeholder="Tự động sinh khi thêm mới"
                  disabled
                  className="cursor-not-allowed bg-slate-100 text-slate-500"
                />
              </div>

              <div className="form-row">
                <label>Số phòng (*):</label>
                <input
                  type="text"
                  name="soPhong"
                  value={formData.soPhong}
                  onChange={handleChange}
                  placeholder="VD: 101, 202, VIP01..."
                />
              </div>
            </div>

            <div>
              <div className="form-row">
                <label>Loại phòng (*):</label>
                <select name="maLoai" value={formData.maLoai} onChange={handleChange}>
                  <option value="">-- Chọn loại phòng --</option>
                  {loaiPhongList.map((lp) => (
                    <option key={lp.maLoai} value={lp.maLoai}>
                      {lp.tenLoai} ({Number(lp.giaPhong ?? 0).toLocaleString('vi-VN')} đ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Trạng thái:</label>
                <select name="trangThai" value={formData.trangThai} onChange={handleChange}>
                  {TRANG_THAI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
        <div className="card-title">Danh sách phòng ({totalElements})</div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[140px]">Mã phòng</th>
                <th className="w-[160px]">Số phòng</th>
                <th>Loại phòng</th>
                <th className="w-[180px]">Giá phòng</th>
                <th className="w-[160px]">Trạng thái</th>
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
                    Chưa có dữ liệu phòng.
                  </td>
                </tr>
              ) : (
                list.map((item) => {
                  const isSelected = isEditing && formData.maPhong === item.maPhong;
                  return (
                    <tr
                      key={item.maPhong}
                      onClick={() => handleSelectRow(item)}
                      className={isSelected ? 'bg-sky-200 font-semibold' : ''}
                    >
                      <td>{item.maPhong}</td>
                      <td>{item.soPhong}</td>
                      <td>{item.tenLoai}</td>
                      <td>{Number(item.giaPhong ?? 0).toLocaleString('vi-VN')} đ</td>
                      <td>{renderStatusBadge(item.trangThai)}</td>
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
            <strong>{totalElements}</strong> phòng)
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
        title="XÁC NHẬN XÓA PHÒNG"
        itemName={`Phòng ${deleteTarget?.soPhong}`}
        itemCode={deleteTarget?.maPhong}
        submitting={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}