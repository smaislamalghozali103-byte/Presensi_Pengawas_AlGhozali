import React, { useEffect, useState } from 'react';
import { RekapItem, UserSession } from '../types';
import { getRekap } from '../services/api';
import { SPREADSHEET_LINKS } from '../data/schedule';
import { exportRekapToExcel } from '../utils/exportExcel';
import { getFullUnitRekap } from '../utils/rekapHelper';
import {
  BarChart3,
  Loader2,
  AlertCircle,
  ExternalLink,
  Table,
  FileSpreadsheet,
  Download,
  CheckCircle2
} from 'lucide-react';

interface RekapTabProps {
  session: UserSession;
  refreshTrigger?: number;
}

export const RekapTab: React.FC<RekapTabProps> = ({ session, refreshTrigger }) => {
  const [rekap, setRekap] = useState<RekapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

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

  // Handler for exporting personal recap
  const handleExportPersonal = () => {
    if (rekap.length === 0) return;
    const cleanName = session.nama.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    exportRekapToExcel(rekap, {
      fileName: `Rekap_Presensi_${session.unit}_${cleanName}_${dateStr}.xls`,
      sheetName: `Rekap ${session.nama.slice(0, 20)}`,
      title: `LAPORAN REKAPITULASI KEHADIRAN PENGAWAS UJIAN`,
      subtitle: `YPI PONDOK MODERN AL-GHOZALI - ${session.unit} | NAMA: ${session.nama}`,
      generatedBy: `Pengawas ${session.nama}`,
    });
    setExportSuccess(`Laporan Excel pengawas ${session.nama} berhasil diunduh!`);
    setTimeout(() => setExportSuccess(null), 3500);
  };

  // Handler for exporting full unit recap (all teachers in unit)
  const handleExportAllUnit = () => {
    const fullData = getFullUnitRekap(session.unit);
    const dateStr = new Date().toISOString().slice(0, 10);
    exportRekapToExcel(fullData, {
      fileName: `Rekap_Presensi_Lengkap_${session.unit}_${dateStr}.xls`,
      sheetName: `Seluruh Pengawas ${session.unit}`,
      title: `LAPORAN KESELURUHAN REKAPITULASI PENGAWAS UJIAN`,
      subtitle: `YPI PONDOK MODERN AL-GHOZALI - JENJANG ${session.unit}`,
      generatedBy: `Administrator Presensi Al-Ghozali`,
    });
    setExportSuccess(`Laporan Excel seluruh pengawas ${session.unit} (${fullData.length} orang) berhasil diunduh!`);
    setTimeout(() => setExportSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Rekap Presensi
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ringkasan kehadiran pengawasan {session.nama} ({session.unit})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Personal Excel Button */}
          <button
            onClick={handleExportPersonal}
            disabled={loading || rekap.length === 0}
            id="btn-export-excel-personal"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            title="Download laporan presensi saya dalam format file Microsoft Excel (.xls)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>

          {/* Export All Teachers in Unit (Visible to Admin or for complete reports) */}
          {session.isAdmin && (
            <button
              onClick={handleExportAllUnit}
              id="btn-export-excel-all"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              title="Download seluruh data rekap semua pengawas di jenjang ini ke Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel Semua {session.unit}</span>
            </button>
          )}

          <button
            onClick={fetchRekap}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-200"
          >
            {loading ? 'Memuat...' : 'Perbarui'}
          </button>
        </div>
      </div>

      {/* Export Success Notification Banner */}
      {exportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{exportSuccess}</span>
          </div>
          <span className="text-2xs text-emerald-700 font-mono">.XLS / Excel Ready</span>
        </div>
      )}

      {/* Spreadsheet Pemantau Direct Link Banner (Only visible if Admin is logged in) */}
      {session.isAdmin && (
        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 text-white rounded-lg">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-950">Spreadsheet Pemantau Langsung (Google Sheets)</h4>
              <p className="text-2xs text-purple-800">
                Akses khusus Administrator untuk memantau data Google Sheets resmi secara live.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={SPREADSHEET_LINKS.SMA.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 py-1.5 px-2.5 bg-white hover:bg-purple-100 border border-purple-300 text-purple-800 rounded-lg text-2xs font-bold transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3 h-3" />
              Sheet SMA
            </a>
            <a
              href={SPREADSHEET_LINKS.SMP.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 py-1.5 px-2.5 bg-white hover:bg-purple-100 border border-purple-300 text-purple-800 rounded-lg text-2xs font-bold transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3 h-3" />
              Sheet SMP
            </a>
          </div>
        </div>
      )}

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
