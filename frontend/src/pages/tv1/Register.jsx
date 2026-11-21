import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Phone, Calendar, Eye, EyeOff, UserPlus, Building2 } from 'lucide-react';
import { tv1Api } from '../../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hoTen: '',
    taiKhoan: '',
    matKhau: '',
    confirmMatKhau: '',
    ngaySinh: '',
    soDienThoai: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hoTen.trim() || !formData.taiKhoan.trim() || !formData.matKhau.trim()) {
      setError('Vui lòng nhập đầy đủ Họ tên, Tài khoản và Mật khẩu.');
      return;
    }

    if (formData.matKhau !== formData.confirmMatKhau) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const payload = {
      hoTen: formData.hoTen.trim(),
      taiKhoan: formData.taiKhoan.trim(),
      matKhau: formData.matKhau,
      xacNhanMk: formData.confirmMatKhau,
      ngaySinh: formData.ngaySinh || null,
      soDienThoai: formData.soDienThoai.trim() || null,
    };

    try {
      setLoading(true);
      setError('');

      const response = await tv1Api.dangKy(payload);
      const resBody = response.data;

      const authData = resBody?.data || resBody?.result || resBody;

      if (authData?.token) {
        localStorage.setItem('token', authData.token);
      }
      if (authData?.userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(authData.userInfo));
      }

      navigate('/phong');
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null);

      setError(serverMsg || 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Building2 size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-wide">
            ĐĂNG KÝ TÀI KHOẢN
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống Quản lý Khách sạn
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                name="hoTen"
                placeholder="VD: Nguyễn Văn A"
                value={formData.hoTen}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tài khoản <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserPlus
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                name="taiKhoan"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={formData.taiKhoan}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="matKhau"
                  placeholder="••••••••"
                  value={formData.matKhau}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-9 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmMatKhau"
                  placeholder="••••••••"
                  value={formData.confirmMatKhau}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ngày sinh
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="date"
                  name="ngaySinh"
                  value={formData.ngaySinh}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="tel"
                  name="soDienThoai"
                  placeholder="0901234567"
                  maxLength={15}
                  value={formData.soDienThoai}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản nhân viên?{' '}
          <Link to="/dang-nhap" className="text-blue-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}