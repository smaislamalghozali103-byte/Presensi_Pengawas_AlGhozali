import React, { useState } from 'react';
import { JadwalItem, UnitSekolah } from '../types';
import { getScheduleMatrix, getSessionTimeRange } from '../data/schedule';
import { Calendar, RefreshCw, Sparkles, LayoutGrid, ListFilter, Search, Clock } from 'lucide-react';
import ReminderCard from './ReminderCard';

interface JadwalTabProps {
  jadwalList: JadwalItem[];
  currentTime: Date;
  currentUnit?: UnitSekolah;
  currentNama?: string;
  onRefresh?: () => void;
}

export const JadwalTab: React.FC<JadwalTabProps> = ({
  jadwalList,
  currentTime,
  currentUnit = 'SMA',
  currentNama = '',
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<'personal' | 'master'>('personal');
  const [filterDay, setFilterDay] = useState<string>('SEMUA');
  const [matrixUnit, setMatrixUnit] = useState<UnitSekolah>(currentUnit);
  const [searchQuery, setSearchQuery] = useState<string>(currentNama);

  const days = ['SEMUA', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

  const filtered = filterDay === 'SEMUA'
    ? jadwalList
    : jadwalList.filter((j) => j.HARI.trim().toUpperCase() === filterDay);

  const matrix = getScheduleMatrix(matrixUnit);

  return (
    <div className="space-y-5">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            {viewMode === 'personal' ? 'Jadwal Pengawasan Saya' : `Tabel Induk Jadwal PTS (${matrixUnit})`}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
            PTS Ganjil TP. 2026-2027 · {currentTime.toLocaleTimeString('id-ID')} WIB
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('personal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'personal'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Jadwal Saya
          </button>
          <button
            onClick={() => setViewMode('master')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'master'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Tabel Seluruh Ruang
          </button>
        </div>
      </div>

      {/* Official Exam Session Time Notice Banner */}
      <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-2xs flex-shrink-0">
            <Clock className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Keterangan Waktu Sesi Ujian PTS:
            </h3>
            <p className="text-2xs text-emerald-800">
              Harap hadir 10 menit sebelum jam ujian dimulai.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-900 shadow-2xs">
            ⏳ <strong>Jam ke-1:</strong> 07.30 - 09.00 WIB
          </span>
          <span className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-900 shadow-2xs">
            ⏳ <strong>Jam ke-2:</strong> 09.15 - 10.45 WIB
          </span>
          <span className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-900 shadow-2xs">
            ⏳ <strong>Jam ke-3:</strong> 11.00 - 12.30 WIB
          </span>
        </div>
      </div>

      {viewMode === 'personal' ? (
        /* Personal View */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {days.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDay(d)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterDay === d
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-500 font-medium">
              Menampilkan <strong>{filtered.length}</strong> sesi pengawasan
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 bg-white border border-gray-200 rounded-xl text-center text-gray-500 text-sm">
              Tidak ada jadwal pengawasan untuk filter hari yang dipilih.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
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
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-emerald-700 font-bold text-sm">
                            Jam {item.JAM_KE}
                          </div>
                          <div className="text-xs font-semibold text-gray-500">
                            {getSessionTimeRange(item.JAM_KE)}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                          Ruang {item.RUANG}
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{item.NAMA_PENGAWAS}</td>
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
      ) : (
        /* Master Matrix View (Matches Official PDF Document) */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            {/* Unit Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">Jenjang:</span>
              <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setMatrixUnit('SMA')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    matrixUnit === 'SMA'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  SMA (Ruang 1 – 10)
                </button>
                <button
                  onClick={() => setMatrixUnit('SMP')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    matrixUnit === 'SMP'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  SMP (Ruang 11 – 26)
                </button>
              </div>
            </div>

            {/* Filter / Highlight Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari & sorot nama guru..."
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-56"
              />
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-gray-300">
                <thead>
                  {/* Top Header: Days */}
                  <tr className="bg-gray-100 text-gray-800 text-center font-bold border-b border-gray-300">
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-gray-300 bg-gray-200 w-16">
                      RUANG
                    </th>
                    <th colSpan={2} className="py-2 px-2 border-r border-gray-300">
                      SENIN<br />
                      <span className="font-normal text-2xs text-gray-600">21 Sept 2026</span>
                    </th>
                    <th colSpan={2} className="py-2 px-2 border-r border-gray-300">
                      SELASA<br />
                      <span className="font-normal text-2xs text-gray-600">22 Sept 2026</span>
                    </th>
                    <th colSpan={3} className="py-2 px-2 border-r border-gray-300 bg-emerald-50 text-emerald-950">
                      RABU<br />
                      <span className="font-normal text-2xs text-emerald-800">23 Sept 2026</span>
                    </th>
                    <th colSpan={2} className="py-2 px-2 border-r border-gray-300">
                      KAMIS<br />
                      <span className="font-normal text-2xs text-gray-600">24 Sept 2026</span>
                    </th>
                    <th colSpan={2} className="py-2 px-2">
                      JUM'AT<br />
                      <span className="font-normal text-2xs text-gray-600">25 Sept 2026</span>
                    </th>
                  </tr>
                  {/* Sub Header: Jam Ke */}
                  <tr className="bg-gray-50 text-gray-700 text-center font-semibold border-b border-gray-300 text-2xs">
                    {matrix.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className={`py-1.5 px-2 border-r border-gray-300 min-w-[130px] ${
                          col.isBlackout ? 'bg-gray-800 text-gray-300' : ''
                        }`}
                      >
                        <div className="font-bold">JAM {col.jam}</div>
                        {!col.isBlackout && (
                          <div className="text-3xs font-medium text-emerald-700">
                            {getSessionTimeRange(col.jam).replace(' WIB', '')}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {matrix.rows.map((row) => (
                    <tr key={row.ruang} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2 px-2.5 font-bold text-center bg-gray-50 border-r border-gray-300 text-gray-900 whitespace-nowrap">
                        R. {row.ruang}
                      </td>
                      {row.pengawas.map((nama, colIdx) => {
                        const isMatch =
                          searchQuery.trim().length >= 2 &&
                          nama &&
                          nama.toLowerCase().includes(searchQuery.trim().toLowerCase());
                        const isBlackout = matrix.columns[colIdx]?.isBlackout;

                        if (isBlackout) {
                          return (
                            <td
                              key={colIdx}
                              className="py-2 px-2 border-r border-gray-300 bg-gray-800 text-gray-400 text-center text-2xs italic font-medium"
                              title="Tidak ada sesi ujian"
                            >
                              —
                            </td>
                          );
                        }

                        return (
                          <td
                            key={colIdx}
                            className={`py-2 px-2 border-r border-gray-300 leading-tight ${
                              isMatch
                                ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400'
                                : 'text-gray-800'
                            }`}
                          >
                            {nama || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium">
                Tarbiyatul Mu'allimin Wal Mu'allimat Al-Islamiyyah Al-Ghozali · TP 2026-2027
              </span>
              <span className="text-2xs text-gray-500">
                Data resmi sesuai jadwal cetak pengawasan PTS Ganjil
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reminder & Berita Acara SOP */}
      <ReminderCard />
    </div>
  );
};

export default JadwalTab;
