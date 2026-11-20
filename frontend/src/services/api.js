import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});



apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// XÁC THỰC, NHÂN VIÊN, LOẠI PHÒNG & PHÒNG
export const tv1Api = {
  // Xác thực
  dangNhap: (data) => apiClient.post('/auth/dang-nhap', data),
  dangKy: (data) => apiClient.post('/auth/dang-ky', data),

  // Nhân viên
  layDSNV: (tuKhoa = '') => apiClient.get('/nhan-vien', { params: { tuKhoa } }),
  themNV: (data) => apiClient.post('/nhan-vien', data),
  suaNV: (maNV, data) => apiClient.put(`/nhan-vien/${maNV}`, data),
  xoaNV: (maNV) => apiClient.delete(`/nhan-vien/${maNV}`),

  // Loại phòng
  layDSLoaiPhong: () => apiClient.get('/loai-phong'),
  themLoaiPhong: (data) => apiClient.post('/loai-phong', data),
  suaLoaiPhong: (maLoai, data) => apiClient.put(`/loai-phong/${maLoai}`, data),
  xoaLoaiPhong: (maLoai) => apiClient.delete(`/loai-phong/${maLoai}`),

  // Phòng
  layDSPhong: (params) => apiClient.get('/phong', { params }),
  chiTietPhong: (maPhong) => apiClient.get(`/phong/${maPhong}`),
  themPhong: (data) => apiClient.post('/phong', data),
  suaPhong: (maPhong, data) => apiClient.put(`/phong/${maPhong}`, data),
  xoaPhong: (maPhong) => apiClient.delete(`/phong/${maPhong}`),
};



// KHÁCH HÀNG, DỊCH VỤ & THUÊ PHÒNG (FUNCTION & STORED PROC)
export const tv2Api = {
  // Khách hàng
  layDSKH: (tuKhoa = '') => apiClient.get('/khach-hang', { params: { tuKhoa } }),
  themKH: (data) => apiClient.post('/khach-hang', data),
  suaKH: (maKH, data) => apiClient.put(`/khach-hang/${maKH}`, data),
  xoaKH: (maKH) => apiClient.delete(`/khach-hang/${maKH}`),

  // Dịch vụ
  layDSDichVu: (tuKhoa = '') => apiClient.get('/dich-vu', { params: { tuKhoa } }),
  themDichVu: (data) => apiClient.post('/dich-vu', data),
  suaDichVu: (maDV, data) => apiClient.put(`/dich-vu/${maDV}`, data),
  xoaDichVu: (maDV) => apiClient.delete(`/dich-vu/${maDV}`),

  // Thuê phòng + SQL Function & Stored Procedure
  layDSThuePhong: () => apiClient.get('/thue-phong'),
  tinhSoNgay: (ngayNhan, ngayTra) =>
    apiClient.get('/thue-phong/tinh-so-ngay', { params: { ngayNhan, ngayTra } }),
  timTheoThoiGian: (ngayBatDau, ngayKetThuc) =>
    apiClient.get('/thue-phong/tim-theo-thoi-gian', { params: { ngayBatDau, ngayKetThuc } }),
  themThuePhong: (data) => apiClient.post('/thue-phong', data),
  suaThuePhong: (maThue, data) => apiClient.put(`/thue-phong/${maThue}`, data),
  xoaThuePhong: (maThue) => apiClient.delete(`/thue-phong/${maThue}`),
};



// SỬ DỤNG DỊCH VỤ & HÓA ĐƠN
export const tv3Api = {
  // Chi tiết Sử dụng dịch vụ
  layDSSDDV: (maThue = '') => apiClient.get('/su-dung-dich-vu', { params: { maThue } }),
  chiTietSDDV: (maSDDV) => apiClient.get(`/su-dung-dich-vu/${maSDDV}`),
  themSDDV: (data) => apiClient.post('/su-dung-dich-vu', data),
  suaSDDV: (maSDDV, data) => apiClient.put(`/su-dung-dich-vu/${maSDDV}`, data),
  xoaSDDV: (maSDDV) => apiClient.delete(`/su-dung-dich-vu/${maSDDV}`),

  // Bảng chính Hóa đơn
  layDSHoaDon: (params) => apiClient.get('/hoa-don', { params }),
  chiTietHoaDon: (maHD) => apiClient.get(`/hoa-don/${maHD}`),
  tinhTongTien: (maThue) => apiClient.get(`/hoa-don/tinh-tong-tien/${maThue}`),
  themHoaDon: (data) => apiClient.post('/hoa-don', data),
  suaHoaDon: (maHD, data) => apiClient.put(`/hoa-don/${maHD}`, data),
  xoaHoaDon: (maHD) => apiClient.delete(`/hoa-don/${maHD}`),
};



// THỐNG KÊ DOANH THU & ĐỌC / XUẤT EXCEL
export const tv4Api = {
  // Thống kê doanh thu
  thongKeDoanhThu: (kieuThongKe, nam) =>
    apiClient.get('/thong-ke/doanh-thu', { params: { kieuThongKe, nam } }),
  thongKeTuNgayDenNgay: (tuNgay, denNgay) =>
    apiClient.get('/thong-ke/tu-ngay-den-ngay', { params: { tuNgay, denNgay } }),
  thongKeTheoQuy: (quy, nam) =>
    apiClient.get('/thong-ke/theo-quy', { params: { quy, nam } }),
  layChiSoTongHop: (params) =>
    apiClient.get('/thong-ke/chi-so-tong-hop', { params }),

  // Đọc & Xuất file Excel
  xuatExcelPhong: () => apiClient.get('/excel/xuat-phong', { responseType: 'blob' }),
  xuatExcelThuePhong: () => apiClient.get('/excel/xuat-thue-phong', { responseType: 'blob' }),
  xuatExcelHoaDon: () => apiClient.get('/excel/xuat-hoa-don', { responseType: 'blob' }),
  xuatExcelThongKe: () => apiClient.get('/excel/xuat-thong-ke', { responseType: 'blob' }),
  docFileExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/excel/doc-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  ghiDatabaseTuExcel: (data) => apiClient.post('/excel/ghi-database', data),
};

export default apiClient;