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
    console.log(">>TOKEN: ",token); 
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
  layDSNV: (tuKhoa = '', size = 10, page = 1) => apiClient.get('/nhan-vien', { params: { keyword: tuKhoa, size, page } }),
  NVDetail:(maNV) =>  apiClient.get(`/nhan-vien/${maNV}`),
  themNV: (data) => apiClient.post('/nhan-vien', data),
  suaNV: (maNV, data) => apiClient.patch(`/nhan-vien/${maNV}`, data),
  xoaNV: (maNV) => apiClient.delete(`/nhan-vien/${maNV}`),

  // Loại phòng
  layDSLoaiPhong: ( size = 10, page = 1) => apiClient.get('/loai-phong',{params:{size, page}}),
  themLoaiPhong: (data) => apiClient.post('/loai-phong', data),
  suaLoaiPhong: (maLoai, data) => apiClient.patch(`/loai-phong/${maLoai}`, data),
  xoaLoaiPhong: (maLoai) => apiClient.delete(`/loai-phong/${maLoai}`),

  // Phòng
  layDSPhong:( size = 10, page = 1) => apiClient.get('/phong',{params:{size, page}}),
  chiTietPhong: (maPhong) => apiClient.get(`/phong/${maPhong}`),
  themPhong: (data) => apiClient.post('/phong', data),
  suaPhong: (maPhong, data) => apiClient.patch(`/phong/${maPhong}`, data),
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
  // Hóa đơn
  layDSHoaDon: (maHoaDon = '', size = 10, page = 1) =>
    apiClient.get('/hoa-don', { params: { maHoaDon, size, page } }),
  xoaHoaDon: (maHoaDon) => apiClient.delete(`/hoa-don/${maHoaDon}`),
  themHoaDon: (data) => apiClient.post('/hoa-don', data),
  layDichVuTheoThue: (maThue) => apiClient.get(`/hoa-don/dich-vu/${maThue}`),
  tinhTongTien: (maThue) => apiClient.get(`/hoa-don/tinh-tong-tien/${maThue}`),

  // Sử dụng dịch vụ
  layDSSDDV: (maSddv = '', size = 10, page = 1) =>
    apiClient.get('/su-dung-dich-vu', { params: { maSddv, size, page } }),
  xoaSDDV: (maSDDV) => apiClient.delete(`/su-dung-dich-vu/${maSDDV}`),
  themSDDV: (data) => apiClient.post('/su-dung-dich-vu', data),
  suaSDDV: (maSddv, data) => apiClient.put(`/su-dung-dich-vu/${maSddv}`, data),
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
  xuatExcelThongKe: (params = {}) =>
     apiClient.get('/excel/xuat-thong-ke', {
       params,
       responseType: 'blob'
     }),
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