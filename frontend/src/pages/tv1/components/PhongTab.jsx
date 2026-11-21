// import React, { useState, useEffect, useCallback } from 'react';
// import { Search, Plus, Save, Trash2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
// import { tv1Api } from '../../../services/api';
// import ConfirmDeleteModal from './ConfirmDeleteModal';

// const INITIAL_FORM = {
//   maPhong: '',
//   tenPhong: '',
//   maLoai: '',
//   trangThai: 'TRONG',
//   ghiChu: '',
// };

// const TRANG_THAI_OPTIONS = [
//   { value: 'TRONG', label: 'Trống', badgeClass: 'bg-green-100 text-green-700' },
//   { value: 'DANG_THUE', label: 'Đang thuê', badgeClass: 'bg-red-100 text-red-700' },
//   { value: 'BAO_TRI', label: 'Bảo trì', badgeClass: 'bg-amber-100 text-amber-700' },
// ];

// export default function PhongTab({ loaiPhongList, onError }) {
//   const [list, setList] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElements, setTotalElements] = useState(0);

//   const [keywordInput, setKeywordInput] = useState('');
//   const [filterLoai, setFilterLoai] = useState('');
//   const [filterTrangThai, setFilterTrangThai] = useState('');
//   const [appliedFilters, setAppliedFilters] = useState({
//     keyword: '',
//     maLoai: '',
//     trangThai: '',
//   });

//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [notice, setNotice] = useState({ type: '', text: '' });
//   const [deleteTarget, setDeleteTarget] = useState(null);

//   const fetchPhong = useCallback(
//     async (page = 1, filters = appliedFilters) => {
//       setLoading(true);
//       try {
//         const res = await tv1Api.layDSPhong({
//           page,
//           size: pageSize,
//           keyword: filters.keyword || undefined,
//           maLoai: filters.maLoai || undefined,
//           trangThai: filters.trangThai || undefined,
//         });
//         const raw = res.data?.data ?? res.data;

//         if (Array.isArray(raw)) {
//           setList(raw);
//           setTotalElements(raw.length);
//           setTotalPages(1);
//           setCurrentPage(1);
//         } else {
//           setList(raw?.content || []);
//           setCurrentPage(raw?.currentPage || page);
//           setTotalPages(Math.max(raw?.totalPages || 1, 1));
//           setTotalElements(raw?.totalElements || 0);
//         }
//       } catch (err) {
//         if (err.response?.status === 404) {
//           setList([]);
//           setTotalElements(0);
//           setTotalPages(1);
//         } else {
//           onError(err, 'Không thể tải danh sách phòng.', setNotice);
//         }
//       } finally {
//         setLoading(false);
//       }
//     },
//     [appliedFilters, onError, pageSize]
//   );

//   useEffect(() => {
//     fetchPhong(currentPage, appliedFilters);
//   }, [fetchPhong, currentPage, appliedFilters]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectRow = (item) => {
//     setNotice({ type: '', text: '' });
//     setIsEditing(true);
//     setFormData({
//       maPhong: item.maPhong || '',
//       tenPhong: item.tenPhong || '',
//       maLoai: item.maLoai || item.loaiPhong?.maLoai || '',
//       trangThai: item.trangThai || 'TRONG',
//       ghiChu: item.ghiChu || '',
//     });
//   };

//   const handleReset = () => {
//     setFormData(INITIAL_FORM);
//     setIsEditing(false);
//     setNotice({ type: '', text: '' });
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setNotice({ type: '', text: '' });

//     if (!formData.maPhong.trim() || !formData.maLoai) {
//       setNotice({ type: 'error', text: 'Vui lòng nhập Mã phòng và chọn Loại phòng.' });
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         maPhong: formData.maPhong.trim().toUpperCase(),
//         tenPhong: formData.tenPhong.trim() || `Phòng ${formData.maPhong.trim().toUpperCase()}`,
//         maLoai: formData.maLoai,
//         trangThai: formData.trangThai,
//         ghiChu: formData.ghiChu.trim() || null,
//       };
//       await tv1Api.themPhong(payload);
//       setNotice({ type: 'success', text: 'Thêm phòng thành công!' });
//       setFormData(INITIAL_FORM);
//       fetchPhong(1, appliedFilters);
//     } catch (err) {
//       onError(err, 'Thêm phòng thất bại.', setNotice);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!isEditing || !formData.maPhong) return;
//     setNotice({ type: '', text: '' });

//     if (!formData.maLoai) {
//       setNotice({ type: 'error', text: 'Vui lòng chọn Loại phòng.' });
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         tenPhong: formData.tenPhong.trim() || `Phòng ${formData.maPhong}`,
//         maLoai: formData.maLoai,
//         trangThai: formData.trangThai,
//         ghiChu: formData.ghiChu.trim() || null,
//       };
//       await tv1Api.suaPhong(formData.maPhong, payload);
//       setNotice({ type: 'success', text: `Cập nhật phòng ${formData.maPhong} thành công!` });
//       fetchPhong(currentPage, appliedFilters);
//     } catch (err) {
//       onError(err, 'Cập nhật phòng thất bại.', setNotice);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setSubmitting(true);
//     setNotice({ type: '', text: '' });
//     try {
//       const deletedId = deleteTarget.maPhong;
//       await tv1Api.xoaPhong(deletedId);
//       const nextPage = list.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
//       setDeleteTarget(null);
//       handleReset();
//       setNotice({ type: 'success', text: `Đã xóa phòng ${deletedId}.` });
//       fetchPhong(nextPage, appliedFilters);
//     } catch (err) {
//       setDeleteTarget(null);
//       onError(err, 'Xóa phòng thất bại.', setNotice);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     setCurrentPage(1);
//     setAppliedFilters({
//       keyword: keywordInput.trim(),
//       maLoai: filterLoai,
//       trangThai: filterTrangThai,
//     });
//   };

//   const handleClearSearch = () => {
//     setKeywordInput('');
//     setFilterLoai('');
//     setFilterTrangThai('');
//     setCurrentPage(1);
//     setAppliedFilters({ keyword: '', maLoai: '', trangThai: '' });
//   };

//   const getLoaiPhongInfo = (item) => {
//     const maLoai = item.maLoai || item.loaiPhong?.maLoai;
//     const found = loaiPhongList.find((lp) => lp.maLoai === maLoai);
//     const tenLoai = item.tenLoai || item.loaiPhong?.tenLoai || found?.tenLoai || maLoai || '—';
//     const donGia = item.donGia ?? item.loaiPhong?.donGia ?? found?.donGia ?? found?.giaPhong;
//     return { tenLoai, donGia };
//   };

//   const renderStatusBadge = (status) => {
//     const found = TRANG_THAI_OPTIONS.find((s) => s.value === status) || {
//       label: status || 'Trống',
//       badgeClass: 'bg-slate-200 text-slate-700',
//     };
//     return (
//       <span className={`inline-block rounded-[3px] px-2 py-0.5 text-xs font-semibold ${found.badgeClass}`}>
//         {found.label}
//       </span>
//     );
//   };

//   const hasActiveFilter =
//     appliedFilters.keyword || appliedFilters.maLoai || appliedFilters.trangThai;

//   return (
//     <div>
//       <div className="card-box">
//         <div className="card-title">
//           {isEditing ? `Cập nhật thông tin phòng (${formData.maPhong})` : 'Thông tin phòng'}
//         </div>

//         {notice.text && (
//           <div
//             className={`mb-3 rounded-[3px] border px-3 py-2 text-[13px] font-semibold ${
//               notice.type === 'error'
//                 ? 'border-red-300 bg-red-100 text-red-700'
//                 : 'border-green-300 bg-green-100 text-green-700'
//             }`}
//           >
//             {notice.text}
//           </div>
//         )}

//         <form onSubmit={handleCreate}>
//           <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
//             <div>
//               <div className="form-row">
//                 <label>Mã phòng (*):</label>
//                 <input
//                   type="text"
//                   name="maPhong"
//                   value={formData.maPhong}
//                   onChange={handleChange}
//                   disabled={isEditing}
//                   placeholder="VD: P101, P202..."
//                   className={isEditing ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}
//                 />
//               </div>

//               <div className="form-row">
//                 <label>Tên phòng:</label>
//                 <input
//                   type="text"
//                   name="tenPhong"
//                   value={formData.tenPhong}
//                   onChange={handleChange}
//                   placeholder="VD: Phòng 101 - Tầng 1"
//                 />
//               </div>

//               <div className="form-row">
//                 <label>Loại phòng (*):</label>
//                 <select name="maLoai" value={formData.maLoai} onChange={handleChange}>
//                   <option value="">-- Chọn loại phòng --</option>
//                   {loaiPhongList.map((lp) => {
//                     const price = lp.donGia ?? lp.giaPhong ?? 0;
//                     return (
//                       <option key={lp.maLoai} value={lp.maLoai}>
//                         {lp.tenLoai} ({Number(price).toLocaleString('vi-VN')} đ)
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <div className="form-row">
//                 <label>Trạng thái:</label>
//                 <select name="trangThai" value={formData.trangThai} onChange={handleChange}>
//                   {TRANG_THAI_OPTIONS.map((opt) => (
//                     <option key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-row">
//                 <label>Ghi chú:</label>
//                 <input
//                   type="text"
//                   name="ghiChu"
//                   value={formData.ghiChu}
//                   onChange={handleChange}
//                   placeholder="View biển, ban công, tình trạng thiết bị..."
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="btn-group">
//             <button
//               type="submit"
//               className="btn inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
//               disabled={isEditing || submitting}
//             >
//               <Plus size={15} /> Thêm mới
//             </button>

//             <button
//               type="button"
//               className="btn btn-warning inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
//               onClick={handleUpdate}
//               disabled={!isEditing || submitting}
//             >
//               <Save size={15} /> Lưu cập nhật
//             </button>

//             <button
//               type="button"
//               className="btn btn-danger inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
//               onClick={() => isEditing && setDeleteTarget(formData)}
//               disabled={!isEditing || submitting}
//             >
//               <Trash2 size={15} /> Xóa
//             </button>

//             <button
//               type="button"
//               className="btn btn-secondary inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
//               onClick={handleReset}
//               disabled={submitting}
//             >
//               <RotateCcw size={15} /> Làm mới
//             </button>
//           </div>
//         </form>
//       </div>

//       <div className="card-box">
//         <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 pb-2">
//           <div className="card-title !mb-0 !border-b-0 !pb-0">
//             Danh sách phòng ({totalElements})
//           </div>

//           <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-1.5">
//             <select
//               value={filterLoai}
//               onChange={(e) => setFilterLoai(e.target.value)}
//               className="rounded-[3px] border border-slate-400 px-2 py-1.5 text-[13px]"
//             >
//               <option value="">Tất cả loại phòng</option>
//               {loaiPhongList.map((lp) => (
//                 <option key={lp.maLoai} value={lp.maLoai}>
//                   {lp.tenLoai}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={filterTrangThai}
//               onChange={(e) => setFilterTrangThai(e.target.value)}
//               className="rounded-[3px] border border-slate-400 px-2 py-1.5 text-[13px]"
//             >
//               <option value="">Tất cả trạng thái</option>
//               {TRANG_THAI_OPTIONS.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="text"
//               value={keywordInput}
//               onChange={(e) => setKeywordInput(e.target.value)}
//               placeholder="Tìm mã phòng, tên phòng..."
//               className="w-[190px] rounded-[3px] border border-slate-400 px-2.5 py-1.5 text-[13px]"
//             />

//             <button type="submit" className="btn inline-flex items-center gap-1">
//               <Search size={14} /> Lọc
//             </button>

//             {hasActiveFilter && (
//               <button type="button" className="btn btn-secondary" onClick={handleClearSearch}>
//                 Xóa lọc
//               </button>
//             )}
//           </form>
//         </div>

//         <div className="data-table-wrapper">
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th className="w-[110px]">Mã phòng</th>
//                 <th className="w-[180px]">Tên phòng</th>
//                 <th className="w-[180px]">Loại phòng</th>
//                 <th className="w-[140px]">Đơn giá</th>
//                 <th className="w-[130px]">Trạng thái</th>
//                 <th>Ghi chú</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="py-4 text-center">
//                     Đang tải dữ liệu...
//                   </td>
//                 </tr>
//               ) : list.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="py-4 text-center text-slate-500">
//                     Không có dữ liệu phòng.
//                   </td>
//                 </tr>
//               ) : (
//                 list.map((item) => {
//                   const isSelected = isEditing && formData.maPhong === item.maPhong;
//                   const { tenLoai, donGia } = getLoaiPhongInfo(item);
//                   return (
//                     <tr
//                       key={item.maPhong}
//                       onClick={() => handleSelectRow(item)}
//                       className={isSelected ? 'bg-sky-200 font-semibold' : ''}
//                     >
//                       <td>{item.maPhong}</td>
//                       <td>{item.tenPhong || `Phòng ${item.maPhong}`}</td>
//                       <td>{tenLoai}</td>
//                       <td>{donGia != null ? `${Number(donGia).toLocaleString('vi-VN')} đ` : '—'}</td>
//                       <td>{renderStatusBadge(item.trangThai)}</td>
//                       <td>{item.ghiChu || '—'}</td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="mt-3 flex items-center justify-between text-[13px]">
//           <div>
//             Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (Tổng:{' '}
//             <strong>{totalElements}</strong> phòng)
//           </div>

//           <div className="flex gap-1.5">
//             <button
//               type="button"
//               className="btn btn-secondary inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
//               disabled={currentPage <= 1 || loading}
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//             >
//               <ChevronLeft size={14} /> Trước
//             </button>

//             <button
//               type="button"
//               className="btn btn-secondary inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
//               disabled={currentPage >= totalPages || loading}
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//             >
//               Sau <ChevronRight size={14} />
//             </button>
//           </div>
//         </div>
//       </div>

//       <ConfirmDeleteModal
//         isOpen={Boolean(deleteTarget)}
//         title="XÁC NHẬN XÓA PHÒNG"
//         itemName={deleteTarget?.tenPhong || `Phòng ${deleteTarget?.maPhong}`}
//         itemCode={deleteTarget?.maPhong}
//         submitting={submitting}
//         onClose={() => setDeleteTarget(null)}
//         onConfirm={confirmDelete}
//       />
//     </div>
//   );
// }