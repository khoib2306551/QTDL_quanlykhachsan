import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Save,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from 'lucide-react';
import { tv1Api } from '../../services/api';

const INITIAL_FORM = {
  maNhanVien: '',
  hoTen: '',
  taiKhoan: '',
  matKhau: '',
  ngaySinh: '',
  soDienThoai: '',
};

export default function NhanVienPage() {
  const navigate = useNavigate();

  const [nhanVienList, setNhanVienList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [keywordInput, setKeywordInput] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleApiError = useCallback(
    (err, fallbackMsg) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/dang-nhap');
        return;
      }
      const resData = err.response?.data;
      const msg = resData?.error || resData?.message || fallbackMsg;
      setNotice({ type: 'error', text: msg });
    },
    [navigate]
  );

  const fetchNhanVien = useCallback(
    async (page = 1, keyword = '') => {
      setLoading(true);
      try {
        const res = await tv1Api.layDSNV(keyword, pageSize, page);
        const pageData = res.data?.data ?? res.data;
        setNhanVienList(pageData.content || []);
        setCurrentPage(pageData.currentPage || page);
        setTotalPages(Math.max(pageData.totalPages || 1, 1));
        setTotalElements(pageData.totalElements || 0);
      } catch (err) {
        handleApiError(err, 'Không thể tải danh sách nhân viên.');
      } finally {
        setLoading(false);
      }
    },
    [handleApiError, pageSize]
  );

  useEffect(() => {
    fetchNhanVien(currentPage, appliedKeyword);
  }, [fetchNhanVien, currentPage, appliedKeyword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectRow = (nv) => {
    setNotice({ type: '', text: '' });
    setIsEditing(true);
    setFormData({
      maNhanVien: nv.maNhanVien || '',
      hoTen: nv.hoTen || '',
      taiKhoan: nv.taiKhoan || '',
      matKhau: '',
      ngaySinh: nv.ngaySinh || '',
      soDienThoai: nv.soDienThoai || '',
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

    if (!formData.hoTen.trim() || !formData.taiKhoan.trim() || !formData.matKhau.trim()) {
      setNotice({ type: 'error', text: 'Vui lòng nhập đầy đủ Họ tên, Tài khoản và Mật khẩu.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        hoTen: formData.hoTen.trim(),
        taiKhoan: formData.taiKhoan.trim(),
        matKhau: formData.matKhau,
        ngaySinh: formData.ngaySinh || null,
        soDienThoai: formData.soDienThoai.trim() || null,
      };

      await tv1Api.themNV(payload);
      setNotice({ type: 'success', text: 'Thêm nhân viên thành công!' });
      setFormData(INITIAL_FORM);
      fetchNhanVien(1, appliedKeyword);
    } catch (err) {
      handleApiError(err, 'Thêm nhân viên thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!isEditing || !formData.maNhanVien) return;
    setNotice({ type: '', text: '' });

    if (!formData.hoTen.trim()) {
      setNotice({ type: 'error', text: 'Họ tên không được để trống.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        hoTen: formData.hoTen.trim(),
        taiKhoan: formData.taiKhoan.trim() || null,
        matKhau: formData.matKhau.trim() ? formData.matKhau : null,
        ngaySinh: formData.ngaySinh || null,
        soDienThoai: formData.soDienThoai.trim(),
      };

      await tv1Api.suaNV(formData.maNhanVien, payload);
      setNotice({ type: 'success', text: `Cập nhật nhân viên ${formData.maNhanVien} thành công!` });
      setFormData((prev) => ({ ...prev, matKhau: '' }));
      fetchNhanVien(currentPage, appliedKeyword);
    } catch (err) {
      handleApiError(err, 'Cập nhật nhân viên thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeletePopup = () => {
    if (!isEditing || !formData.maNhanVien) return;
    setDeleteTarget({
      maNhanVien: formData.maNhanVien,
      hoTen: formData.hoTen,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    setNotice({ type: '', text: '' });
    try {
      const deletedId = deleteTarget.maNhanVien;
      await tv1Api.xoaNV(deletedId);

      const nextPage = nhanVienList.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setDeleteTarget(null);
      handleReset();
      setNotice({ type: 'success', text: `Đã xóa nhân viên ${deletedId}.` });
      fetchNhanVien(nextPage, appliedKeyword);
    } catch (err) {
      setDeleteTarget(null);
      handleApiError(err, 'Xóa nhân viên thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedKeyword(keywordInput.trim());
  };

  const handleClearSearch = () => {
    setKeywordInput('');
    setCurrentPage(1);
    setAppliedKeyword('');
  };

  return (
    <div>
      <div className="card-box">
        <div className="card-title">
          {isEditing
            ? `Cập nhật thông tin nhân viên (${formData.maNhanVien})`
            : 'Thông tin nhân viên'}
        </div>

        {notice.text && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '12px',
              borderRadius: '3px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: notice.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: notice.type === 'error' ? '#b91c1c' : '#15803d',
              border: `1px solid ${notice.type === 'error' ? '#fca5a5' : '#86efac'}`,
            }}
          >
            {notice.text}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div>
              <div className="form-row">
                <label>Mã nhân viên:</label>
                <input
                  type="text"
                  name="maNhanVien"
                  value={formData.maNhanVien}
                  placeholder="Tự động sinh khi thêm mới"
                  disabled
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-row">
                <label>Họ và tên (*):</label>
                <input
                  type="text"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleChange}
                  placeholder="Nhập họ tên nhân viên"
                />
              </div>

              <div className="form-row">
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  name="ngaySinh"
                  value={formData.ngaySinh}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="form-row">
                <label>Tài khoản (*):</label>
                <input
                  type="text"
                  name="taiKhoan"
                  value={formData.taiKhoan}
                  onChange={handleChange}
                  placeholder="Tên đăng nhập"
                />
              </div>

              <div className="form-row">
                <label>{isEditing ? 'Mật khẩu mới:' : 'Mật khẩu (*):'}</label>
                <input
                  type="password"
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleChange}
                  placeholder={isEditing ? 'Để trống nếu không đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
                />
              </div>

              <div className="form-row">
                <label>Số điện thoại:</label>
                <input
                  type="text"
                  name="soDienThoai"
                  value={formData.soDienThoai}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>
          </div>

          <div className="btn-group">
            <button
              type="submit"
              className="btn"
              disabled={isEditing || submitting}
              title={isEditing ? 'Bấm "Làm mới" để quay lại chế độ thêm nhân viên' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isEditing || submitting ? 0.5 : 1,
                cursor: isEditing || submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <UserPlus size={15} /> Thêm mới
            </button>

            <button
              type="button"
              className="btn btn-warning"
              onClick={handleUpdate}
              disabled={!isEditing || submitting}
              title={!isEditing ? 'Chọn một nhân viên trong bảng để cập nhật' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: !isEditing || submitting ? 0.5 : 1,
                cursor: !isEditing || submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={15} /> Lưu cập nhật
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={openDeletePopup}
              disabled={!isEditing || submitting}
              title={!isEditing ? 'Chọn một nhân viên trong bảng để xóa' : ''}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: !isEditing || submitting ? 0.5 : 1,
                cursor: !isEditing || submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Trash2 size={15} /> Xóa
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: submitting ? 0.5 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <RotateCcw size={15} /> Làm mới
            </button>
          </div>
        </form>
      </div>

      <div className="card-box">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '12px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '8px',
          }}
        >
          <div className="card-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            Danh sách nhân viên ({totalElements})
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Tìm mã, họ tên, tài khoản, SĐT..."
              style={{
                padding: '6px 10px',
                border: '1px solid #94a3b8',
                borderRadius: '3px',
                fontSize: '13px',
                width: '250px',
              }}
            />
            <button
              type="submit"
              className="btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Search size={14} /> Tìm
            </button>
            {appliedKeyword && (
              <button type="button" className="btn btn-secondary" onClick={handleClearSearch}>
                Tất cả
              </button>
            )}
          </form>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Mã nhân viên</th>
                <th>Họ và tên</th>
                <th>Tài khoản</th>
                <th style={{ width: '130px' }}>Ngày sinh</th>
                <th style={{ width: '150px' }}>Số điện thoại</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : nhanVienList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                    Không có dữ liệu nhân viên.
                  </td>
                </tr>
              ) : (
                nhanVienList.map((nv) => {
                  const isSelected = isEditing && formData.maNhanVien === nv.maNhanVien;
                  return (
                    <tr
                      key={nv.maNhanVien}
                      onClick={() => handleSelectRow(nv)}
                      style={{
                        backgroundColor: isSelected ? '#bae6fd' : undefined,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <td>{nv.maNhanVien}</td>
                      <td>{nv.hoTen}</td>
                      <td>{nv.taiKhoan || '—'}</td>
                      <td>{nv.ngaySinh || '—'}</td>
                      <td>{nv.soDienThoai || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            fontSize: '13px',
          }}
        >
          <div>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (Tổng:{' '}
            <strong>{totalElements}</strong> nhân viên)
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentPage <= 1 || loading ? 0.5 : 1,
                cursor: currentPage <= 1 || loading ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} /> Trước
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentPage >= totalPages || loading ? 0.5 : 1,
                cursor: currentPage >= totalPages || loading ? 'not-allowed' : 'pointer',
              }}
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div
          onClick={() => !submitting && setDeleteTarget(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              width: '100%',
              maxWidth: '410px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                backgroundColor: '#26596a',
                color: '#ffffff',
                padding: '10px 14px',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#eab308" /> XÁC NHẬN XÓA NHÂN VIÊN
              </span>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '16px 14px', fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa nhân viên{' '}
              <strong>{deleteTarget.hoTen}</strong> ({deleteTarget.maNhanVien}) không?
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#dc2626' }}>
                Hành động này không thể hoàn tác.
              </div>
            </div>

            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                disabled={submitting}
                onClick={() => setDeleteTarget(null)}
                style={{ cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={submitting}
                onClick={confirmDelete}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Trash2 size={14} /> {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}