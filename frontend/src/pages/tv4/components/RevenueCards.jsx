import { FileText, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('vi-VN');
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export default function RevenueCards({ summary, loading }) {
  const metrics = [
    {
      label: 'Tổng doanh thu',
      value: currencyFormatter.format(asNumber(summary?.tongDoanhThu)),
      helper: 'Tổng giá trị hóa đơn',
      icon: Wallet,
      tone: 'blue',
    },
    {
      label: 'Số lượng hóa đơn',
      value: numberFormatter.format(asNumber(summary?.soLuongHoaDon)),
      helper: 'Hóa đơn trong kỳ',
      icon: FileText,
      tone: 'teal',
    },
    {
      label: 'Hóa đơn cao nhất',
      value: currencyFormatter.format(asNumber(summary?.hoaDonCaoNhat)),
      helper: 'Giá trị lớn nhất',
      icon: TrendingUp,
      tone: 'green',
    },
    {
      label: 'Hóa đơn thấp nhất',
      value: currencyFormatter.format(asNumber(summary?.hoaDonThapNhat)),
      helper: 'Giá trị nhỏ nhất',
      icon: TrendingDown,
      tone: 'amber',
    },
    {
      label: 'Trung bình hóa đơn',
      value: currencyFormatter.format(asNumber(summary?.trungBinhHoaDon)),
      helper: 'Doanh thu bình quân / hóa đơn',
      icon: Wallet,
      tone: 'violet',
    },
  ];

  return (
    <div className="revenue-cards-grid">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article className={`revenue-metric-card tone-${metric.tone}`} key={metric.label}>
            <div className="revenue-metric-topline">
              <span>{metric.label}</span>
              <span className="revenue-metric-icon"><Icon size={18} /></span>
            </div>
            <strong className={loading ? 'revenue-skeleton-text' : ''}>
              {loading ? 'Đang tải' : metric.value}
            </strong>
            <small>{metric.helper}</small>
          </article>
        );
      })}
    </div>
  );
}
