import {
  BedDouble,
  CalendarRange,
  Download,
  FileSpreadsheet,
  ReceiptText,
  ChartNoAxesCombined,
  LoaderCircle,
} from 'lucide-react';

const EXPORT_ITEMS = [
  {
    key: 'phong',
    title: 'Danh sách phòng',
    description: 'Thông tin phòng, loại phòng, giá và trạng thái hiện tại.',
    icon: BedDouble,
    filename: 'danh-sach-phong.xlsx',
  },
  {
    key: 'thuePhong',
    title: 'Danh sách thuê phòng',
    description: 'Thông tin khách hàng, phòng, ngày nhận, ngày trả và trạng thái thuê.',
    icon: CalendarRange,
    filename: 'danh-sach-thue-phong.xlsx',
  },
  {
    key: 'hoaDon',
    title: 'Danh sách hóa đơn',
    description: 'Thông tin hóa đơn và worksheet chi tiết dịch vụ liên quan.',
    icon: ReceiptText,
    filename: 'danh-sach-hoa-don.xlsx',
  },
];

export default function ExcelActions({ busyAction, statsFilter, onStatsFilterChange, onExport }) {
  const updateFilter = (field, value) => {
    onStatsFilterChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <section className="card-box">
        <div className="card-title">Xuất dữ liệu hệ thống</div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {EXPORT_ITEMS.map((item) => {
            const Icon = item.icon;
            const loading = busyAction === item.key;
            return (
              <article key={item.key} className="flex min-h-44 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">.xlsx</p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.description}</p>
                <button
                  type="button"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#26596a] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4857] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={Boolean(busyAction)}
                  onClick={() => onExport(item.key)}
                >
                  {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
                  {loading ? 'Đang tạo file...' : 'Tải Excel'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card-box">
        <div className="card-title">Xuất báo cáo doanh thu</div>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${statsFilter.cheDo === 'KY' ? 'border-[#26596a] bg-[#26596a] text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            onClick={() => updateFilter('cheDo', 'KY')}
          >
            Theo kỳ thống kê
          </button>
          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${statsFilter.cheDo === 'KHOANG_NGAY' ? 'border-[#26596a] bg-[#26596a] text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            onClick={() => updateFilter('cheDo', 'KHOANG_NGAY')}
          >
            Theo khoảng ngày
          </button>
        </div>

        {statsFilter.cheDo === 'KY' ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">
              Kiểu thống kê
              <select
                className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-[#26596a] focus:ring-2 focus:ring-[#26596a]/15"
                value={statsFilter.kieuThongKe}
                onChange={(event) => updateFilter('kieuThongKe', event.target.value)}
              >
                <option value="NGAY">Ngày</option>
                <option value="TUAN">Tuần</option>
                <option value="THANG">Tháng</option>
                <option value="QUY">Quý</option>
                <option value="NAM">Năm</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Năm
              <input
                type="number"
                min="1000"
                max="9999"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#26596a] focus:ring-2 focus:ring-[#26596a]/15"
                value={statsFilter.nam}
                onChange={(event) => updateFilter('nam', event.target.value)}
              />
            </label>
            {statsFilter.kieuThongKe === 'QUY' ? (
              <label className="text-sm font-semibold text-slate-700">
                Quý
                <select
                  className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-[#26596a] focus:ring-2 focus:ring-[#26596a]/15"
                  value={statsFilter.quy}
                  onChange={(event) => updateFilter('quy', event.target.value)}
                >
                  <option value="1">Quý I</option>
                  <option value="2">Quý II</option>
                  <option value="3">Quý III</option>
                  <option value="4">Quý IV</option>
                </select>
              </label>
            ) : <div className="hidden md:block" />}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Từ ngày
              <input
                type="date"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#26596a] focus:ring-2 focus:ring-[#26596a]/15"
                value={statsFilter.tuNgay}
                onChange={(event) => updateFilter('tuNgay', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Đến ngày
              <input
                type="date"
                min={statsFilter.tuNgay || undefined}
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#26596a] focus:ring-2 focus:ring-[#26596a]/15"
                value={statsFilter.denNgay}
                onChange={(event) => updateFilter('denNgay', event.target.value)}
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-xs leading-5 text-slate-600">
            <FileSpreadsheet size={16} className="mt-0.5 shrink-0 text-emerald-700" />
            <span>File gồm worksheet tổng quan và chi tiết doanh thu. Bộ lọc được gửi kèm khi xuất.</span>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={Boolean(busyAction)}
            onClick={() => onExport('thongKe')}
          >
            {busyAction === 'thongKe' ? <LoaderCircle size={16} className="animate-spin" /> : <ChartNoAxesCombined size={16} />}
            Xuất báo cáo
          </button>
        </div>
      </section>
    </div>
  );
}
