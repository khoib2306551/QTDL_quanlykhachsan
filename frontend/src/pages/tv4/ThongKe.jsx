import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { tv4Api } from '../../services/api';
import RevenueCards from './components/RevenueCards';
import RevenueChart from './components/RevenueChart';
import RevenueFilter from './components/RevenueFilter';
import RevenueTable from './components/RevenueTable';
import './ThongKe.css';

const CURRENT_YEAR = new Date().getFullYear();
const INITIAL_FILTER = {
  kieuThongKe: 'THANG',
  nam: CURRENT_YEAR,
  quy: 1,
  tuNgay: `${CURRENT_YEAR}-01-01`,
  denNgay: `${CURRENT_YEAR}-12-31`,
};

function unwrapResponse(response) {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload.data ?? payload.result ?? payload;
  }
  return payload;
}

function getErrorMessage(error) {
  const payload = error?.response?.data;
  if (typeof payload === 'string' && payload.trim()) return payload;
  return payload?.message || payload?.error || error?.message || 'Không thể tải dữ liệu thống kê.';
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getYearRange(year) {
  return {
    tuNgay: `${year}-01-01`,
    denNgay: `${year}-12-31`,
  };
}

function getQuarterRange(year, quarter) {
  const firstMonth = (Number(quarter) - 1) * 3 + 1;
  const lastMonth = firstMonth + 2;
  const pad = (value) => String(value).padStart(2, '0');
  const lastDay = new Date(Number(year), lastMonth, 0).getDate();
  return {
    tuNgay: `${year}-${pad(firstMonth)}-01`,
    denNgay: `${year}-${pad(lastMonth)}-${pad(lastDay)}`,
  };
}

function buildFallbackSummary(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const totalInvoices = safeRows.reduce((sum, row) => sum + toNumber(row.soLuongHoaDon), 0);
  const totalRevenue = safeRows.reduce((sum, row) => sum + toNumber(row.tongDoanhThu), 0);
  const highestInvoice = safeRows.reduce(
    (current, row) => Math.max(current, toNumber(row.hoaDonCaoNhat)), 0,
  );
  const lowestCandidates = safeRows
    .filter((row) => toNumber(row.soLuongHoaDon) > 0)
    .map((row) => toNumber(row.hoaDonThapNhat));
  const weightedAverageTotal = safeRows.reduce(
    (sum, row) => sum + toNumber(row.trungBinhHoaDon) * toNumber(row.soLuongHoaDon),
    0,
  );

  return {
    soLuongHoaDon: totalInvoices,
    hoaDonCaoNhat: highestInvoice,
    hoaDonThapNhat: lowestCandidates.length ? Math.min(...lowestCandidates) : 0,
    trungBinhHoaDon: totalInvoices ? weightedAverageTotal / totalInvoices : 0,
    tongDoanhThu: totalRevenue,
  };
}

function normalizeRows(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function getPeriodLabel(filter) {
  if (filter.kieuThongKe === 'KHOANG_NGAY') {
    return `Từ ${filter.tuNgay} đến ${filter.denNgay}`;
  }
  if (filter.kieuThongKe === 'QUY') {
    return `Quý ${filter.quy}/${filter.nam}`;
  }
  return `Năm ${filter.nam}`;
}

export default function ThongKePage() {
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [chartRows, setChartRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const periodLabel = useMemo(() => getPeriodLabel(filter), [filter]);

  const loadStatistics = useCallback(async (selectedFilter) => {
    setLoading(true);
    setError('');

    try {
      let rows = [];
      let summaryData = null;

      if (selectedFilter.kieuThongKe === 'KHOANG_NGAY') {
        const { tuNgay, denNgay } = selectedFilter;
        const [rowsResponse, summaryResponse] = await Promise.all([
          tv4Api.thongKeTuNgayDenNgay(tuNgay, denNgay),
          tv4Api.layChiSoTongHop({ tuNgay, denNgay }),
        ]);
        rows = normalizeRows(unwrapResponse(rowsResponse));
        summaryData = unwrapResponse(summaryResponse);
      } else if (selectedFilter.kieuThongKe === 'QUY') {
        const yearRowsPromise = tv4Api.thongKeDoanhThu('QUY', selectedFilter.nam);
        const quarterRange = getQuarterRange(selectedFilter.nam, selectedFilter.quy);
        const quarterPromise = tv4Api.thongKeTheoQuy(selectedFilter.quy, selectedFilter.nam);
        const summaryPromise = tv4Api.layChiSoTongHop(quarterRange);
        const [rowsResponse, quarterResponse, summaryResponse] = await Promise.all([
          yearRowsPromise,
          quarterPromise,
          summaryPromise,
        ]);

        rows = normalizeRows(unwrapResponse(rowsResponse));
        const selectedQuarter = unwrapResponse(quarterResponse);
        if (selectedQuarter && !rows.some((row) => Number(row.quy) === Number(selectedFilter.quy))) {
          rows = [...rows, selectedQuarter].sort((a, b) => Number(a.quy) - Number(b.quy));
        }
        summaryData = unwrapResponse(summaryResponse);
      } else {
        const yearRange = getYearRange(selectedFilter.nam);
        const [rowsResponse, summaryResponse] = await Promise.all([
          tv4Api.thongKeDoanhThu(selectedFilter.kieuThongKe, selectedFilter.nam),
          tv4Api.layChiSoTongHop(yearRange),
        ]);
        rows = normalizeRows(unwrapResponse(rowsResponse));
        summaryData = unwrapResponse(summaryResponse);
      }

      setChartRows(rows);
      setSummary(summaryData || buildFallbackSummary(rows));
      setLastUpdated(new Date());
    } catch (requestError) {
      setChartRows([]);
      setSummary(null);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics(INITIAL_FILTER);
  }, [loadStatistics]); // Tải dữ liệu mặc định khi mở trang.

  const handleApplyFilter = (event) => {
    event.preventDefault();

    if (filter.kieuThongKe === 'KHOANG_NGAY') {
      if (!filter.tuNgay || !filter.denNgay) {
        setError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
        return;
      }
      if (filter.tuNgay > filter.denNgay) {
        setError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
        return;
      }
    } else if (!Number.isInteger(Number(filter.nam)) || Number(filter.nam) < 1000 || Number(filter.nam) > 9999) {
      setError('Năm thống kê phải nằm trong khoảng 1000 đến 9999.');
      return;
    }

    loadStatistics({ ...filter, nam: Number(filter.nam), quy: Number(filter.quy) });
  };

  return (
    <div className="revenue-page">
      <div className="revenue-page-heading">
        <div>
          <div className="revenue-eyebrow"><BarChart3 size={15} /> BÁO CÁO VẬN HÀNH</div>
          <h1>Thống kê doanh thu</h1>
          <p>Theo dõi doanh thu và các chỉ số hóa đơn theo thời gian.</p>
        </div>
        <button
          type="button"
          className="revenue-refresh-button"
          onClick={() => loadStatistics({ ...filter, nam: Number(filter.nam), quy: Number(filter.quy) })}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'revenue-spin' : ''} />
          Làm mới
        </button>
      </div>

      <RevenueFilter
        value={filter}
        onChange={setFilter}
        onSubmit={handleApplyFilter}
        loading={loading}
      />

      {error && (
        <div className="revenue-alert" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="revenue-section-heading">
        <div>
          <h2><TrendingUp size={18} /> Tổng quan doanh thu</h2>
          <span>{periodLabel}</span>
        </div>
        {lastUpdated && (
          <div className="revenue-updated">
            <CalendarDays size={14} />
            Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      <RevenueCards summary={summary} loading={loading} />

      <div className="revenue-content-grid">
        <RevenueChart rows={chartRows} type={filter.kieuThongKe} loading={loading} />
        <div className="revenue-side-note">
          <div className="revenue-side-note-icon"><CalendarDays size={19} /></div>
          <h3>Nguyên tắc ghi nhận</h3>
          <p>Doanh thu được tổng hợp từ trường <strong>TongTien</strong> của bảng <strong>HoaDon</strong>, theo ngày lập hóa đơn <strong>NgayLapHoaDon</strong>.</p>
          <div className="revenue-side-note-divider" />
          <p className="revenue-side-note-muted">Database hiện chưa có trạng thái thanh toán hoặc hủy hóa đơn. Vì vậy, báo cáo phản ánh tất cả hóa đơn nằm trong khoảng thời gian đã chọn.</p>
        </div>
      </div>

      <RevenueTable rows={chartRows} type={filter.kieuThongKe} loading={loading} />
    </div>
  );
}
