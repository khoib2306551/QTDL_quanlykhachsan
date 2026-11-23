import { ClipboardList } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat('vi-VN');

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getPeriod(row, type) {
  if (type === 'NGAY' || type === 'KHOANG_NGAY') return row.mocThoiGian || '—';
  if (type === 'TUAN') return `Tuần ${row.tuanThu ?? '—'} / ${row.nam ?? ''}`;
  if (type === 'THANG') return `Tháng ${row.thang ?? '—'} / ${row.nam ?? ''}`;
  if (type === 'QUY') return `Quý ${row.quy ?? '—'} / ${row.nam ?? ''}`;
  return `Năm ${row.nam ?? '—'}`;
}

export default function RevenueTable({ rows = [], type, loading }) {
  const sortedRows = [...rows].sort((a, b) => {
    if (type === 'NGAY' || type === 'KHOANG_NGAY') return String(b.mocThoiGian).localeCompare(String(a.mocThoiGian));
    const key = type === 'TUAN' ? 'tuanThu' : type === 'THANG' ? 'thang' : type === 'QUY' ? 'quy' : 'nam';
    return asNumber(b[key]) - asNumber(a[key]);
  });

  return (
    <section className="revenue-panel revenue-table-panel">
      <div className="revenue-panel-heading">
        <div>
          <h3><ClipboardList size={17} /> Chi tiết thống kê</h3>
          <p>{sortedRows.length} mốc thời gian có dữ liệu</p>
        </div>
      </div>
      <div className="revenue-table-wrap">
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Mốc thời gian</th>
              <th className="align-right">Số hóa đơn</th>
              <th className="align-right">Cao nhất</th>
              <th className="align-right">Thấp nhất</th>
              <th className="align-right">Trung bình</th>
              <th className="align-right">Tổng doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="revenue-table-message">Đang tải dữ liệu...</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan="6" className="revenue-table-message">Chưa có dữ liệu để hiển thị.</td></tr>
            ) : sortedRows.map((row, index) => (
              <tr key={`${getPeriod(row, type)}-${index}`}>
                <td className="revenue-period-cell">{getPeriod(row, type)}</td>
                <td className="align-right">{numberFormatter.format(asNumber(row.soLuongHoaDon))}</td>
                <td className="align-right">{currencyFormatter.format(asNumber(row.hoaDonCaoNhat))}</td>
                <td className="align-right">{currencyFormatter.format(asNumber(row.hoaDonThapNhat))}</td>
                <td className="align-right">{currencyFormatter.format(asNumber(row.trungBinhHoaDon))}</td>
                <td className="align-right revenue-total-cell">{currencyFormatter.format(asNumber(row.tongDoanhThu))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
