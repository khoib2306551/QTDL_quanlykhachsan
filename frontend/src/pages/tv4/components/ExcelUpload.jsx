import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileUp, LoaderCircle, RefreshCw, UploadCloud } from 'lucide-react';

export default function ExcelUpload({ selectedFile, busy, onChooseFile, onReadFile, onDownloadTemplate }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      onChooseFile(null);
      window.alert('Chỉ chấp nhận file có định dạng .xlsx.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onChooseFile(null);
      window.alert('Kích thước file không được vượt quá 10 MB.');
      return;
    }
    onChooseFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  return (
    <section className="card-box">
      <div className="card-title">Chọn file Excel để nhập</div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />

      <div
        role="button"
        tabIndex={0}
        className={`rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging ? 'border-[#26596a] bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-[#26596a] hover:bg-slate-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#26596a] shadow-sm">
          <UploadCloud size={25} />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-800">Kéo thả file Excel vào đây</p>
        <p className="mt-1 text-xs text-slate-500">hoặc nhấn để chọn file từ máy tính</p>
        <p className="mt-3 text-xs text-slate-400">Chấp nhận .xlsx · Tối đa 10 MB</p>
      </div>

      {selectedFile && (
        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <FileSpreadsheet className="shrink-0 text-emerald-700" size={20} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-emerald-900">{selectedFile.name}</p>
              <p className="text-xs text-emerald-700">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }}
            disabled={busy}
          >
            <RefreshCw size={15} /> Chọn file khác
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#26596a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4857] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReadFile}
          disabled={!selectedFile || busy}
        >
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <FileUp size={16} />}
          {busy ? 'Đang đọc file...' : 'Đọc và xem trước'}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          onClick={onDownloadTemplate}
          disabled={busy}
        >
          <Download size={16} /> Tải file mẫu
        </button>
      </div>
    </section>
  );
}
