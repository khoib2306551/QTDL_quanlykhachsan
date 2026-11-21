import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, Layers } from 'lucide-react';
import { tv1Api } from '../../services/api';
// import PhongTab from './components/PhongTab';
import LoaiPhongTab from './components/LoaiPhongTab';

export default function PhongPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('phong');
  const [loaiPhongList, setLoaiPhongList] = useState([]);

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

  const loadAllLoaiPhong = useCallback(async () => {
    try {
      const res = await tv1Api.layDSLoaiPhong({ page: 1, size: 100 });
      const raw = res.data?.data ?? res.data;
      setLoaiPhongList(Array.isArray(raw) ? raw : raw?.content || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/dang-nhap');
      }
    }
  }, [navigate]);

  useEffect(() => {
    loadAllLoaiPhong();
  }, [loadAllLoaiPhong]);

  return (
    <div>
      <div className="mb-3.5 flex gap-2 border-b-2 border-slate-300 pb-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('phong')}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#26596a] px-4 py-2 text-[13px] font-bold transition-colors ${
            activeTab === 'phong'
              ? 'bg-[#26596a] text-white'
              : 'bg-white text-[#26596a] hover:bg-slate-50'
          }`}
        >
          <BedDouble size={16} /> Quản lý Phòng
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('loai-phong')}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#26596a] px-4 py-2 text-[13px] font-bold transition-colors ${
            activeTab === 'loai-phong'
              ? 'bg-[#26596a] text-white'
              : 'bg-white text-[#26596a] hover:bg-slate-50'
          }`}
        >
          <Layers size={16} /> Quản lý Loại phòng
        </button>
      </div>

      {/* {activeTab === 'phong' ? (
        <PhongTab loaiPhongList={loaiPhongList} onError={handleApiError} />
      ) : (
        <LoaiPhongTab onError={handleApiError} onDataChanged={loadAllLoaiPhong} />
      )} */}
    </div>
  );
}