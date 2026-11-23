import { BarChart3 } from 'lucide-react';

const currencyCompact = new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function amount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLabel(row, type) {
  if (type === 'NGAY' || type === 'KHOANG_NGAY') return row.mocThoiGian || '';
  if (type === 'TUAN') return `Tuần ${row.tuanThu ?? ''}`;
  if (type === 'THANG') return `Tháng ${row.thang ?? ''}`;
  if (type === 'QUY') return `Quý ${row.quy ?? ''}`;
  return `Năm ${row.nam ?? ''}`;
}

function shortDate(dateValue) {
  if (!dateValue) return '';
  const parts = String(dateValue).split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateValue;
}

export default function RevenueChart({ rows = [], type, loading }) {
  const chartRows = [...rows].sort((a, b) => {
    if (type === 'NGAY' || type === 'KHOANG_NGAY') return String(a.mocThoiGian).localeCompare(String(b.mocThoiGian));
    const key = type === 'TUAN' ? 'tuanThu' : type === 'THANG' ? 'thang' : type === 'QUY' ? 'quy' : 'nam';
    return amount(a[key]) - amount(b[key]);
  });

  const values = chartRows.map((row) => amount(row.tongDoanhThu));
  const maxValue = Math.max(...values, 0);
  const width = 900;
  const height = 300;
  const padding = { top: 24, right: 24, bottom: 48, left: 76 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const coordinates = chartRows.map((row, index) => {
    const x = chartRows.length <= 1
      ? padding.left + plotWidth / 2
      : padding.left + (index / (chartRows.length - 1)) * plotWidth;
    const value = amount(row.tongDoanhThu);
    const y = padding.top + plotHeight - (maxValue > 0 ? (value / maxValue) * plotHeight : 0);
    return { x, y, value, row };
  });
  const linePath = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const tickIndices = new Set(
    chartRows.length <= 7
      ? chartRows.map((_, index) => index)
      : Array.from({ length: 7 }, (_, index) => Math.round((index * (chartRows.length - 1)) / 6)),
  );

  return (
    <section className="revenue-panel revenue-chart-panel">
      <div className="revenue-panel-heading">
        <div>
          <h3><BarChart3 size={17} /> Biểu đồ doanh thu</h3>
          <p>Diễn biến tổng tiền hóa đơn theo từng mốc thời gian</p>
        </div>
        <span className="revenue-chart-unit">Đơn vị: VNĐ</span>
      </div>

      {loading ? (
        <div className="revenue-chart-empty">Đang tải dữ liệu biểu đồ...</div>
      ) : chartRows.length === 0 ? (
        <div className="revenue-chart-empty">Không có dữ liệu doanh thu trong khoảng thời gian này.</div>
      ) : (
        <div className="revenue-chart-scroll">
          <svg className="revenue-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ đường doanh thu">
            {[0, 1, 2, 3].map((step) => {
              const y = padding.top + (plotHeight / 3) * step;
              const value = maxValue * (1 - step / 3);
              return (
                <g key={step}>
                  <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="revenue-chart-gridline" />
                  <text x={padding.left - 12} y={y + 4} textAnchor="end" className="revenue-chart-axis-label">
                    {currencyCompact.format(value)}
                  </text>
                </g>
              );
            })}
            {coordinates.length > 1 && <path d={linePath} className="revenue-chart-line" />}
            {coordinates.map((point, index) => (
              <g key={`${getLabel(point.row, type)}-${index}`}>
                <circle cx={point.x} cy={point.y} r="4.5" className="revenue-chart-point">
                  <title>{`${getLabel(point.row, type)}: ${new Intl.NumberFormat('vi-VN').format(point.value)} VNĐ`}</title>
                </circle>
                {tickIndices.has(index) && (
                  <text x={point.x} y={height - 17} textAnchor="middle" className="revenue-chart-axis-label">
                    {type === 'NGAY' || type === 'KHOANG_NGAY' ? shortDate(point.row.mocThoiGian) : getLabel(point.row, type)}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}
