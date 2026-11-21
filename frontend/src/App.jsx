import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AdminLayout from './components/AdminLayout';

import AuthPage from './pages/tv1/Auth';
import RegisterPage from './pages/tv1/Register';
import PhongPage from './pages/tv1/Phong';
import NhanVienPage from './pages/tv1/NhanVien';
import KhachHangDichVuPage from './pages/tv2/KhachHangDichVu';
import ThuePhongPage from './pages/tv2/ThuePhong';
import HoaDonPage from './pages/tv3/HoaDon';
import ThongKePage from './pages/tv4/ThongKe';
import ExcelPage from './pages/tv4/Excel';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/dang-nhap" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dang-nhap" element={<AuthPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/phong" replace />} />
          {/* Thành viên 1 */}
          <Route path="phong" element={<PhongPage />} />
          <Route path="nhan-vien" element={<NhanVienPage />} />
          {/* Thành viên 2 */}
          <Route path="khach-hang-dich-vu" element={<KhachHangDichVuPage />} />
          <Route path="thue-phong" element={<ThuePhongPage />} />
          {/* Thành viên 3 */}
          <Route path="hoa-don" element={<HoaDonPage />} />
          {/* Thành viên 4 */}
          <Route path="thong-ke" element={<ThongKePage />} />
          <Route path="excel" element={<ExcelPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/phong" replace />} />
      </Routes>
    </BrowserRouter>
  );
}