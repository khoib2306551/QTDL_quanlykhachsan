import { useEffect, useState } from 'react';
import { tv3Api } from '../../services/api';

export default function HoaDonPage() {
  const [dsHoaDon, setDsHoaDon] = useState([]);
  const [loi, setLoi] = useState('');

  const taiDSHoaDon = async () => {
    try {
      const res = await tv3Api.layDSHoaDon({});
      setDsHoaDon(res.data);
    } catch (e) {
      setLoi('Không tải được danh sách hóa đơn');
    }
  };

  useEffect(() => {
    taiDSHoaDon();
  }, []);

  return (
    <div className="card-box">
      <div className="card-title">Hóa đơn</div>
      {loi && <p>{loi}</p>}
      <div className="data-table-wrapper">
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
              <tr key={hd.maHoaDon}>
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
  );
}