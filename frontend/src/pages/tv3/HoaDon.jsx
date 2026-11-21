import { useEffect, useState } from 'react';
import { tv3Api } from '../../services/api';

const TIM_RONG = { maHoaDon: '', maKhachHang: '', ngayLap: '' };
const SDDV_RONG = { maSddv: '', maDichVu: '', soLuong: 1, ngaySuDung: '' };

export default function HoaDonPage() {
  const [dsHoaDon, setDsHoaDon] = useState([]);
  const [tim, setTim] = useState(TIM_RONG);
  const [chon, setChon] = useState(null);
  const [sd, setSd] = useState(SDDV_RONG);
  const [thongBao, setThongBao] = useState('');
  const [tien, setTien] = useState(null);

  const taiDSHoaDon = async (params = TIM_RONG) => {
    try {
      const res = await tv3Api.layDSHoaDon(params);
      setDsHoaDon(res.data);
    } catch (e) {
      setThongBao('Không tải được danh sách hóa đơn');
    }
  };

  const taiTien = async (maThue) => {
    try {
      const res = await tv3Api.tinhTongTien(maThue);
      setTien(res.data);
    } catch (e) {
      setTien(null);
    }
  };

  const tinhLaiVaTai = async () => {
    await tv3Api.suaHoaDon(chon.maHoaDon, { maSddv: chon.maSddv });
    await chonHoaDon(chon.maHoaDon);
    await taiDSHoaDon(tim);
  };

  const chonHoaDon = async (maHoaDon) => {
    try {
      const res = await tv3Api.chiTietHoaDon(maHoaDon);
      setChon(res.data);
      if (res.data.maThue) {
        taiTien(res.data.maThue);
      } else {
        setTien(null);
      }
      setSd(SDDV_RONG);
      setThongBao('');
    } catch (e) {
      setThongBao('Không tải được chi tiết hóa đơn');
    }
  };

  const doiO = (e) => setTim({ ...tim, [e.target.name]: e.target.value });
  const doiSd = (e) => setSd({ ...sd, [e.target.name]: e.target.value });

  const lamMoi = () => {
    setTim(TIM_RONG);
    taiDSHoaDon(TIM_RONG);
  };

  const duLieuSd = () => ({
    maThue: chon.maThue,
    maDichVu: sd.maDichVu.trim(),
    soLuong: Number(sd.soLuong),
    ngaySuDung: sd.ngaySuDung,
  });

  const themSd = async () => {
    try {
      await tv3Api.themSDDV(duLieuSd());
      await tinhLaiVaTai();
      setThongBao('Đã thêm dịch vụ');
    } catch (e) {
      setThongBao('Không thêm được: kiểm tra mã dịch vụ, số lượng và ngày sử dụng');
    }
  };

  const suaSd = async () => {
    if (!sd.maSddv) {
      setThongBao('Bấm vào một dòng dịch vụ để sửa');
      return;
    }
    try {
      await tv3Api.suaSDDV(sd.maSddv, duLieuSd());
      await tinhLaiVaTai();
      setThongBao('Đã sửa dịch vụ');
    } catch (e) {
      setThongBao('Không sửa được: kiểm tra mã dịch vụ, số lượng và ngày sử dụng');
    }
  };

  const xoaSd = async () => {
    if (!sd.maSddv) {
      setThongBao('Bấm vào một dòng dịch vụ để xóa');
      return;
    }
    if (!window.confirm(`Xóa dòng dịch vụ ${sd.maSddv}?`)) return;
    try {
      await tv3Api.xoaSDDV(sd.maSddv);
      await tinhLaiVaTai();
      setThongBao('Đã xóa dịch vụ');
    } catch (e) {
      setThongBao(
        e.response?.status === 409
          ? 'Dịch vụ này đang gắn với hóa đơn nên không xóa được'
          : 'Không xóa được dịch vụ'
      );
    }
  };

  useEffect(() => {
    taiDSHoaDon();
  }, []);

  return (
    <>
      <div className="card-box">
        <div className="card-title">Hóa đơn</div>

        <div className="form-row">
          <label>Mã hóa đơn</label>
          <input name="maHoaDon" value={tim.maHoaDon} onChange={doiO} />
        </div>
        <div className="form-row">
          <label>Mã khách hàng</label>
          <input name="maKhachHang" value={tim.maKhachHang} onChange={doiO} />
        </div>
        <div className="form-row">
          <label>Ngày lập</label>
          <input type="date" name="ngayLap" value={tim.ngayLap} onChange={doiO} />
        </div>
        <div className="btn-group">
          <button className="btn" onClick={() => taiDSHoaDon(tim)}>Tìm kiếm</button>
          <button className="btn btn-secondary" onClick={lamMoi}>Làm mới</button>
        </div>

        <div className="data-table-wrapper" style={{ marginTop: 12 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Mã SDDV</th>
                <th>Ngày lập</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {dsHoaDon.map((hd) => (
                <tr
                  key={hd.maHoaDon}
                  onClick={() => chonHoaDon(hd.maHoaDon)}
                  style={chon?.maHoaDon === hd.maHoaDon ? { backgroundColor: '#bae6fd' } : {}}
                >
                  <td>{hd.maHoaDon}</td>
                  <td>{hd.maSddv}</td>
                  <td>{hd.ngayLapHoaDon}</td>
                  <td>{Number(hd.tongTien).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-box">
        <div className="card-title">
          Sử dụng dịch vụ {chon?.maThue ? `- phiếu thuê ${chon.maThue} (hóa đơn ${chon.maHoaDon})` : ''}
        </div>
        {thongBao && <p><b>{thongBao}</b></p>}
        {!chon && <p>Bấm vào một hóa đơn để xem các dịch vụ đã sử dụng.</p>}
        {chon && !chon.maThue && <p>Hóa đơn này chưa gắn với phiếu thuê nào.</p>}
        {tien && chon?.maThue && (
          <p>
            Tiền phòng: <b>{Number(tien.tienPhong).toLocaleString('vi-VN')}</b>
            {' | '}Tiền dịch vụ: <b>{Number(tien.tienDichVu).toLocaleString('vi-VN')}</b>
            {' | '}Tổng: <b>{Number(tien.tongTien).toLocaleString('vi-VN')}</b>
            {Number(tien.tongTien) !== Number(chon.tongTien) && ' (khác tổng đã lưu, bấm Cập nhật tổng tiền)'}
          </p>
        )}
        {chon?.maThue && (
          <>
            <div className="form-row">
              <label>Mã SDDV</label>
              <input value={sd.maSddv} readOnly placeholder="Tự sinh khi thêm" />
            </div>
            <div className="form-row">
              <label>Mã dịch vụ</label>
              <input name="maDichVu" value={sd.maDichVu} onChange={doiSd} />
            </div>
            <div className="form-row">
              <label>Số lượng</label>
              <input type="number" min="1" name="soLuong" value={sd.soLuong} onChange={doiSd} />
            </div>
            <div className="form-row">
              <label>Ngày sử dụng</label>
              <input type="date" name="ngaySuDung" value={sd.ngaySuDung} onChange={doiSd} />
            </div>
            <div className="btn-group">
              <button className="btn" onClick={themSd}>Thêm</button>
              <button className="btn btn-warning" onClick={suaSd}>Sửa</button>
              <button className="btn btn-danger" onClick={xoaSd}>Xóa</button>
              <button className="btn btn-secondary" onClick={() => setSd(SDDV_RONG)}>Làm mới</button>
              <button
                className="btn"
                onClick={async () => {
                  try {
                    await tinhLaiVaTai();
                    setThongBao('Đã cập nhật tổng tiền hóa đơn');
                  } catch (e) {
                    setThongBao('Không cập nhật được tổng tiền');
                  }
                }}
              >
                Cập nhật tổng tiền
              </button>
            </div>

            <div className="data-table-wrapper" style={{ marginTop: 12 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã SDDV</th>
                    <th>Mã thuê</th>
                    <th>Mã dịch vụ</th>
                    <th>Số lượng</th>
                    <th>Ngày sử dụng</th>
                  </tr>
                </thead>
                <tbody>
                  {chon.danhSachDichVu.map((d) => (
                    <tr
                      key={d.maSddv}
                      onClick={() =>
                        setSd({
                          maSddv: d.maSddv,
                          maDichVu: d.maDichVu,
                          soLuong: d.soLuong,
                          ngaySuDung: d.ngaySuDung,
                        })
                      }
                      style={sd.maSddv === d.maSddv ? { backgroundColor: '#bae6fd' } : {}}
                    >
                      <td>{d.maSddv}</td>
                      <td>{d.maThue}</td>
                      <td>{d.maDichVu}</td>
                      <td>{d.soLuong}</td>
                      <td>{d.ngaySuDung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}