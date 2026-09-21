import React, { useEffect, useState } from 'react';
import { RekapItem, UserSession } from '../types';
import { getRekap } from '../services/api';
import { BarChart3, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface RekapTabProps {
  session: UserSession;
  refreshTrigger?: number;
}

export const RekapTab: React.FC<RekapTabProps> = ({ session, refreshTrigger }) => {
  const [rekap, setRekap] = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRekap = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getRekap(session.unit, session.nama);
      if (res.ok && res.data) {
        setRekap(res.data);
      } else {
        setErrorMsg(res.message || 'Rekap gagal dimuat.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat rekap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekap();
  }, [session.unit, session.nama, refreshTrigger]);

  const summary = rekap[0];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Rekap Presensi
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ringkasan kehadiran pengawasan {session.nama} ({session.unit})
          </p>
        </div>

        <button
          onClick={fetchRekap}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
        >
          {loading ? 'Memuat...' : 'Perbarui'}
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-sm">Memuat rekapitulasi kehadiran...</span>
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      ) : rekap.length === 0 ? (
        <div className="p-8 bg-white border border-gray-200 rounded-xl text-center text-gray-500 text-sm">
          Belum ada data presensi.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick metric cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">Hadir</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">{summary.HADIR || 0}</span>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">Izin</span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">{summary.IZIN || 0}</span>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">Sakit</span>
                <span className="text-2xl font-black text-amber-700 mt-1 block">{summary.SAKIT || 0}</span>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">Alpa</span>
                <span className="text-2xl font-black text-rose-700 mt-1 block">{summary.ALPA || 0}</span>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center col-span-2 sm:col-span-1">
                <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider block">Digantikan</span>
                <span className="text-2xl font-black text-purple-700 mt-1 block">{summary.DIGANTIKAN || 0}</span>
              </div>
            </div>
          )}

          {/* Full Rekap Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Pengawas</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4 text-center">Jml Mengawas</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Hadir</th>
                    <th className="py-3 px-4 text-center text-blue-700">Izin</th>
                    <th className="py-3 px-4 text-center text-amber-700">Sakit</th>
                    <th className="py-3 px-4 text-center text-rose-700">Alpa</th>
                    <th className="py-3 px-4 text-center text-purple-700">Digantikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rekap.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{row['NAMA PENGAWAS']}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800">
                          {row.UNIT}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-800">{row['JUMLAH MENGAWAS']}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">{row.HADIR}</td>
                      <td className="py-3 px-4 text-center font-bold text-blue-700">{row.IZIN}</td>
                      <td className="py-3 px-4 text-center font-bold text-amber-700">{row.SAKIT}</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-700">{row.ALPA}</td>
                      <td className="py-3 px-4 text-center font-bold text-purple-700">{row.DIGANTIKAN}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
