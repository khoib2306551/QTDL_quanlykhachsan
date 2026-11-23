import React, { useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  BarChart3,
  Receipt,
  ShieldUser,
  Building2,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('userInfo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const displayName = currentUser?.hoTen || currentUser?.taiKhoan || 'Quản trị viên';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/dang-nhap');
  };

  return (
    <div className="admin-wrapper">
      <header className="top-bar">
        <div
          className="top-bar-brand"
          onClick={() => navigate('/phong')}
          title="Về trang chính"
        >
          <div className="brand-icon">
            <Building2 size={18} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <span className="top-bar-title">QUẢN LÝ KHÁCH SẠN</span>
            <span className="top-bar-subtitle">Hệ thống điều hành nội bộ</span>
          </div>
        </div>

        <div className="top-bar-actions">
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => navigate(-1)}
            title="Quay lại trang trước"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            className="header-user-btn"
            onClick={() => navigate('/nhan-vien')}
            title="Quản lý tài khoản nhân viên"
          >
            <span className="header-avatar">{avatarInitial}</span>
            <span className="header-username">{displayName}</span>
          </button>

          <span className="header-divider" />

          <button
            type="button"
            className="header-logout-btn"
            onClick={handleLogout}
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
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