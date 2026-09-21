import React, { useState } from 'react';
import { JadwalItem } from '../types';
import { Calendar, RefreshCw, Sparkles } from 'lucide-react';

interface JadwalTabProps {
  jadwalList: JadwalItem[];
  currentTime: Date;
  onRefresh?: () => void;
}

export const JadwalTab: React.FC<JadwalTabProps> = ({ jadwalList, currentTime, onRefresh }) => {
  const [filterDay, setFilterDay] = useState<string>('SEMUA');

  const days = ['SEMUA', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

  const filtered = filterDay === 'SEMUA'
    ? jadwalList
    : jadwalList.filter((j) => j.HARI.trim().toUpperCase() === filterDay);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Jadwal Pengawasan Saya
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
            Real-time · diperbarui otomatis setiap 15 detik · {currentTime.toLocaleTimeString('id-ID')} WIB
          </p>
        </div>

        {/* Day Filter */}
        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDay(d)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterDay === d
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 bg-white border border-gray-200 rounded-xl text-center text-gray-500 text-sm">
          Tidak ada jadwal untuk filter hari yang dipilih.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Hari</th>
                  <th className="py-3 px-4">Jam Ke</th>
                  <th className="py-3 px-4">Ruang</th>
                  <th className="py-3 px-4">Pengawas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item, idx) => (
                  <tr key={`${item.RUANG}-${item.JAM_KE}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">{item.TANGGAL}</td>
                    <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {item.HARI}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold whitespace-nowrap">
                      Jam {item.JAM_KE}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                      Ruang {item.RUANG}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{item.NAMA_PENGAWAS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <span>Total: {filtered.length} sesi pengawasan</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Terdaftar dalam PTS Ganjil 2026/2027
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
