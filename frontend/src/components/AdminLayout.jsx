import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BedDouble, Users, CalendarCheck, FileSpreadsheet, BarChart3, Receipt, ShieldUser } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="admin-wrapper">
      <header className="top-bar">
        <div className="top-bar-links">
          <button onClick={() => navigate('/nhan-vien')}>Tài khoản</button>
          <button onClick={() => navigate(-1)}>Trở về</button>
          <button onClick={() => {
             localStorage.removeItem("token");
            localStorage.removeItem("userInfo");
            navigate('/dang-nhap')}}>Thoát</button>
        </div>
        <div className="top-bar-title">HỆ THỐNG QUẢN LÝ KHÁCH SẠN</div>
        <div>Admin</div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <NavLink to="/phong" className="nav-item">
            <BedDouble size={18} /> Phòng & Loại phòng
          </NavLink>
          <NavLink to="/nhan-vien" className="nav-item">
            <ShieldUser size={18} /> Nhân viên
          </NavLink>
          <NavLink to="/khach-hang-dich-vu" className="nav-item">
            <Users size={18} /> Khách & Dịch vụ
          </NavLink>
          <NavLink to="/thue-phong" className="nav-item">
            <CalendarCheck size={18} /> Thuê phòng
          </NavLink>
          <NavLink to="/hoa-don" className="nav-item">
            <Receipt size={18} /> Hóa đơn & SDDV
          </NavLink>
          <NavLink to="/thong-ke" className="nav-item">
            <BarChart3 size={18} /> Thống kê
          </NavLink>
          <NavLink to="/excel" className="nav-item">
            <FileSpreadsheet size={18} /> Xuất / Đọc Excel
          </NavLink>
        </aside>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}