import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ClipboardList } from 'lucide-react';
import HoaDonTab from './components/HoaDonTab';
import SddvTab from './components/SddvTab';

export default function HoaDonPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hoa-don');

  const handleApiError = useCallback(
    (err, fallbackMsg, setNotice) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/dang-nhap');
        return;
      }
      const resData = err.response?.data;
      const msg = resData?.error || resData?.message || fallbackMsg;
      setNotice?.({ type: 'error', text: msg });
    },
    [navigate]
  );

  return (
    <div>
      <div className="mb-3.5 flex gap-2 border-b-2 border-slate-300 pb-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('hoa-don')}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#26596a] px-4 py-2 text-[13px] font-bold transition-colors ${
            activeTab === 'hoa-don'
              ? 'bg-[#26596a] text-white'
              : 'bg-white text-[#26596a] hover:bg-slate-50'
          }`}
        >
          <FileText size={16} /> Hóa đơn
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sddv')}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#26596a] px-4 py-2 text-[13px] font-bold transition-colors ${
            activeTab === 'sddv'
              ? 'bg-[#26596a] text-white'
              : 'bg-white text-[#26596a] hover:bg-slate-50'
          }`}
        >
          <ClipboardList size={16} /> Sử dụng dịch vụ
        </button>
      </div>

      {activeTab === 'hoa-don' ? (
        <HoaDonTab onError={handleApiError} />
      ) : (
        <SddvTab onError={handleApiError} />
      )}
    </div>
  );
}