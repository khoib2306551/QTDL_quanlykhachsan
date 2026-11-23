import { Filter, Search } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'NGAY', label: 'Ngày' },
  { value: 'TUAN', label: 'Tuần' },
  { value: 'THANG', label: 'Tháng' },
  { value: 'QUY', label: 'Quý' },
  { value: 'NAM', label: 'Năm' },
  { value: 'KHOANG_NGAY', label: 'Khoảng ngày' },
];

export default function RevenueFilter({ value, onChange, onSubmit, loading }) {
  const update = (field, nextValue) => {
    onChange((current) => ({ ...current, [field]: nextValue }));
  };

  return (
    <form className="revenue-filter-card" onSubmit={onSubmit}>
      <div className="revenue-filter-title">
        <Filter size={17} />
        <span>Bộ lọc báo cáo</span>
      </div>

      <div className="revenue-filter-fields">
        <div className="revenue-field revenue-field-period">
          <label htmlFor="revenue-period">Kiểu thống kê</label>
          <select
            id="revenue-period"
            value={value.kieuThongKe}
            onChange={(event) => update('kieuThongKe', event.target.value)}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {value.kieuThongKe !== 'KHOANG_NGAY' ? (
          <>
            <div className="revenue-field">
              <label htmlFor="revenue-year">Năm</label>
              <input
                id="revenue-year"
                type="number"
                min="1000"
                max="9999"
                value={value.nam}
                onChange={(event) => update('nam', event.target.value)}
                required
              />
            </div>
            {value.kieuThongKe === 'QUY' && (
              <div className="revenue-field">
                <label htmlFor="revenue-quarter">Quý</label>
                <select
                  id="revenue-quarter"
                  value={value.quy}
                  onChange={(event) => update('quy', Number(event.target.value))}
                >
                  <option value={1}>Quý I</option>
                  <option value={2}>Quý II</option>
                  <option value={3}>Quý III</option>
                  <option value={4}>Quý IV</option>
                </select>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="revenue-field">
              <label htmlFor="revenue-from">Từ ngày</label>
              <input
                id="revenue-from"
                type="date"
                value={value.tuNgay}
                onChange={(event) => update('tuNgay', event.target.value)}
                required
              />
            </div>
            <div className="revenue-field">
              <label htmlFor="revenue-to">Đến ngày</label>
              <input
                id="revenue-to"
                type="date"
                value={value.denNgay}
                onChange={(event) => update('denNgay', event.target.value)}
                min={value.tuNgay || undefined}
                required
              />
            </div>
          </>
        )}

        <button className="revenue-apply-button" type="submit" disabled={loading}>
          <Search size={16} />
          {loading ? 'Đang tải...' : 'Áp dụng'}
        </button>
      </div>
    </form>
  );
}
