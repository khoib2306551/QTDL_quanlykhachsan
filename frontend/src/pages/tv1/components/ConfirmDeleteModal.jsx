import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  title,
  itemName,
  itemCode,
  submitting,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={() => !submitting && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[410px] overflow-hidden rounded border border-slate-300 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between bg-[#26596a] px-3.5 py-2.5 text-sm font-bold text-white">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400" /> {title}
          </span>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="flex cursor-pointer items-center border-none bg-transparent text-white disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-3.5 py-4 text-sm leading-relaxed text-slate-800">
          Bạn có chắc chắn muốn xóa <strong>{itemName}</strong> ({itemCode}) không?
          <div className="mt-1.5 text-xs text-red-600">Hành động này không thể hoàn tác.</div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <button
            type="button"
            className="btn btn-secondary disabled:cursor-not-allowed"
            disabled={submitting}
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-danger inline-flex items-center gap-1.5 disabled:cursor-not-allowed"
            disabled={submitting}
            onClick={onConfirm}
          >
            <Trash2 size={14} /> {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}