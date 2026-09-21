import React, { useState } from 'react';
import { ExamTimeSettings, LockMode, UnitSekolah } from '../types';
import { SPREADSHEET_LINKS, saveExamSettings } from '../data/schedule';
import { exportRekapToExcel } from '../utils/exportExcel';
import { getFullUnitRekap } from '../utils/rekapHelper';
import { SCHOOL_LOCATION } from '../utils/geolocation';
import {
  KeyRound,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Save,
  ShieldCheck,
  Table,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Info,
  FileSpreadsheet,
  MapPin
} from 'lucide-react';

interface AdminTabProps {
  settings: ExamTimeSettings;
  onUpdateSettings: (newSettings: ExamTimeSettings) => void;
  currentUnit: UnitSekolah;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  settings,
  onUpdateSettings,
  currentUnit,
}) => {
  // PIN update states
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Time and Lock settings states
  const [startTime, setStartTime] = useState(settings.startTime);
  const [endTime, setEndTime] = useState(settings.endTime);
  const [lockMode, setLockMode] = useState<LockMode>(settings.lockMode);
  const [timeFeedback, setTimeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Copied spreadsheet link indicator
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [exportAdminFeedback, setExportAdminFeedback] = useState<string | null>(null);

  const handleExportUnitExcel = (unit: UnitSekolah) => {
    const fullData = getFullUnitRekap(unit);
    const dateStr = new Date().toISOString().slice(0, 10);
    exportRekapToExcel(fullData, {
      fileName: `Rekap_Presensi_Lengkap_${unit}_${dateStr}.xls`,
      sheetName: `Seluruh Pengawas ${unit}`,
      title: `LAPORAN KESELURUHAN REKAPITULASI PENGAWAS UJIAN`,
      subtitle: `YPI PONDOK MODERN AL-GHOZALI - JENJANG ${unit}`,
      generatedBy: `Administrator Presensi Al-Ghozali`,
    });
    setExportAdminFeedback(`File Excel rekap seluruh pengawas ${unit} (${fullData.length} orang) berhasil diunduh!`);
    setTimeout(() => setExportAdminFeedback(null), 3500);
  };

  const handleCopyLink = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);

    if (oldPin !== settings.adminPin) {
      setPinFeedback({ type: 'error', message: 'PIN Lama tidak sesuai.' });
      return;
    }

    if (!/^\d{6,}$/.test(newPin)) {
      setPinFeedback({ type: 'error', message: 'PIN Baru harus berupa minimal 6 digit angka.' });
      return;
    }

    if (newPin !== confirmPin) {
      setPinFeedback({ type: 'error', message: 'Konfirmasi PIN Baru tidak cocok.' });
      return;
    }

    const updated: ExamTimeSettings = {
      ...settings,
      adminPin: newPin,
    };

    saveExamSettings(updated);
    onUpdateSettings(updated);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinFeedback({ type: 'success', message: 'PIN Administrator berhasil diperbarui!' });
  };

  const handleUpdateTimeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeFeedback(null);

    if (!startTime || !endTime) {
      setTimeFeedback({ type: 'error', message: 'Jam mulai dan jam selesai harus diisi.' });
      return;
    }

    const updated: ExamTimeSettings = {
      ...settings,
      startTime,
      endTime,
      lockMode,
    };

    saveExamSettings(updated);
    onUpdateSettings(updated);
    setTimeFeedback({ type: 'success', message: 'Pengaturan jam ujian & status kunci berhasil disimpan!' });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-blue-900">Panel Administrator & Pemantau</h2>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Kelola PIN keamanan administrator, atur batas jam digital pengawasan untuk mengunci akses pengawas bila waktu selesai, dan pantau spreadsheet resmi secara langsung.
          </p>
        </div>
      </div>

      {/* SECTION 1: SPREADSHEET PEMANTAU (Live Google Sheets) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        {exportAdminFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{exportAdminFeedback}</span>
            </div>
            <span className="text-2xs text-emerald-700 font-mono">.XLS / Excel</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <Table className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-bold text-gray-900">Spreadsheet Pemantau Pengawas Ujian</h3>
            <p className="text-xs text-gray-500">Tautan langsung menuju Google Sheets master untuk memantau presensi dan rekap.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* SMA Sheet Card */}
          <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 bg-gray-50/70 hover:bg-emerald-50/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Jenjang SMA
                </span>
                <span className="text-2xs text-gray-400 font-mono">ID: ...{SPREADSHEET_LINKS.SMA.id.slice(-8)}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">{SPREADSHEET_LINKS.SMA.name}</h4>
              <p className="text-xs text-gray-500 mb-3">
                Memantau data kehadiran pengawas, ruang ujian 1–10, dan rekapitulasi kehadiran SMA.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200/60">
              <div className="flex items-center gap-2">
                <a
                  href={SPREADSHEET_LINKS.SMA.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-open-spreadsheet-sma"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Spreadsheet SMA
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyLink(SPREADSHEET_LINKS.SMA.url, 'SMA')}
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-xs transition-colors"
                  title="Salin Tautan Spreadsheet SMA"
                >
                  {copiedLink === 'SMA' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleExportUnitExcel('SMA')}
                id="btn-export-excel-admin-sma"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                title="Unduh seluruh rekap kehadiran pengawas SMA ke file Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Unduh Rekap Excel SMA (.xls)
              </button>
            </div>
          </div>

          {/* SMP Sheet Card */}
          <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 bg-gray-50/70 hover:bg-emerald-50/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  Jenjang SMP
                </span>
                <span className="text-2xs text-gray-400 font-mono">ID: ...{SPREADSHEET_LINKS.SMP.id.slice(-8)}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">{SPREADSHEET_LINKS.SMP.name}</h4>
              <p className="text-xs text-gray-500 mb-3">
                Memantau data kehadiran pengawas, ruang ujian 11–26, dan rekapitulasi kehadiran SMP.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200/60">
              <div className="flex items-center gap-2">
                <a
                  href={SPREADSHEET_LINKS.SMP.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-open-spreadsheet-smp"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Spreadsheet SMP
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyLink(SPREADSHEET_LINKS.SMP.url, 'SMP')}
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-xs transition-colors"
                  title="Salin Tautan Spreadsheet SMP"
                >
                  {copiedLink === 'SMP' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleExportUnitExcel('SMP')}
                id="btn-export-excel-admin-smp"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                title="Unduh seluruh rekap kehadiran pengawas SMP ke file Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                Unduh Rekap Excel SMP (.xls)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 2: PENGATURAN JAM UJIAN & SISTEM KUNCI DIGITAL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Pengaturan Jam & Kunci Otomatis</h3>
              <p className="text-xs text-gray-500">Kunci pengawas otomatis bila waktu ujian telah berakhir.</p>
            </div>
          </div>

          {timeFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                timeFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {timeFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{timeFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdateTimeSettings} className="space-y-4">
            {/* Quick Session Reference */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center justify-between">
                <span>Rujukan Jam Ujian PTS Ganjil:</span>
                <button
                  type="button"
                  onClick={() => {
                    setStartTime('07:15');
                    setEndTime('12:45');
                  }}
                  className="text-3xs font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 hover:bg-emerald-100 transition-colors"
                >
                  Set Sesuai Jadwal (07:15 - 12:45)
                </button>
              </div>
              <div className="text-2xs text-emerald-800 grid grid-cols-1 sm:grid-cols-3 gap-1">
                <div>⏳ <strong>Jam 1:</strong> 07.30 - 09.00 WIB</div>
                <div>⏳ <strong>Jam 2:</strong> 09.15 - 10.45 WIB</div>
                <div>⏳ <strong>Jam 3:</strong> 11.00 - 12.30 WIB</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="input-jam-mulai">
                  Jam Buka Presensi (WIB)
                </label>
                <input
                  id="input-jam-mulai"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="input-jam-selesai">
                  Jam Kunci Presensi (WIB)
                </label>
                <input
                  id="input-jam-selesai"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mode Kontrol Penguncian
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer text-xs hover:bg-gray-50">
                  <input
                    type="radio"
                    name="lock_mode"
                    value="AUTO"
                    checked={lockMode === 'AUTO'}
                    onChange={() => setLockMode('AUTO')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">🕒 Otomatis (Sesuai Jam Ujian)</span>
                    <span className="text-gray-500 text-2xs block">
                      Mengunci pengawas secara otomatis setelah pukul {endTime} WIB.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer text-xs hover:bg-gray-50">
                  <input
                    type="radio"
                    name="lock_mode"
                    value="FORCE_OPEN"
                    checked={lockMode === 'FORCE_OPEN'}
                    onChange={() => setLockMode('FORCE_OPEN')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-emerald-700 block flex items-center gap-1">
                      <Unlock className="w-3.5 h-3.5" /> Buka Kunci Manual (Bypass)
                    </span>
                    <span className="text-gray-500 text-2xs block">
                      Izinkan pengawas masuk kapan saja untuk keperluan pengujian / susulan.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer text-xs hover:bg-gray-50">
                  <input
                    type="radio"
                    name="lock_mode"
                    value="FORCE_LOCKED"
                    checked={lockMode === 'FORCE_LOCKED'}
                    onChange={() => setLockMode('FORCE_LOCKED')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-rose-700 block flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Kunci Sekarang (Manual Lock)
                    </span>
                    <span className="text-gray-500 text-2xs block">
                      Tutup seluruh akses pengawas segera (hanya Admin yang bisa masuk).
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              id="btn-save-time-settings"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan Jam & Kunci
            </button>
          </form>
        </div>

        {/* SECTION 3: FITUR PENGATURAN PIN ADMINISTRATOR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <KeyRound className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Pengaturan PIN Administrator</h3>
              <p className="text-xs text-gray-500">Ubah kode PIN untuk keamanan akses administrator.</p>
            </div>
          </div>

          {pinFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                pinFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {pinFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{pinFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="input-old-pin">
                PIN Lama
              </label>
              <input
                id="input-old-pin"
                type="password"
                maxLength={10}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Masukkan PIN saat ini (default: 123456)"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="input-new-pin">
                PIN Baru (Minimal 6 Angka)
              </label>
              <input
                id="input-new-pin"
                type="password"
                maxLength={10}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Masukkan minimal 6 angka baru..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="input-confirm-pin">
                Konfirmasi PIN Baru
              </label>
              <input
                id="input-confirm-pin"
                type="password"
                maxLength={10}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Ketik ulang PIN baru..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="p-2.5 bg-gray-50 rounded-lg flex items-start gap-2 text-2xs text-gray-500">
              <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>PIN Administrator digunakan untuk masuk saat sistem terkunci dan membuka fitur pengaturan ini.</span>
            </div>

            <button
              type="submit"
              id="btn-update-admin-pin"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              Simpan PIN Baru
            </button>
          </form>
        </div>
      </div>

      {/* Geofencing Location Info Card for Admin */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Ketentuan Lokasi Presensi (Geofencing GPS)</h3>
            <p className="text-xs text-gray-500">
              Validasi batas jarak fisik pengawas saat melakukan presensi ujian secara realtime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
            <span className="text-3xs uppercase font-bold text-gray-500 tracking-wider">Lokasi Kampus Resmi</span>
            <div className="font-bold text-gray-900 text-sm">{SCHOOL_LOCATION.name}</div>
            <p className="text-gray-600 leading-relaxed font-medium">{SCHOOL_LOCATION.address}</p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
            <span className="text-3xs uppercase font-bold text-gray-500 tracking-wider">Batas Toleransi Radius GPS</span>
            <div className="font-bold text-emerald-700 text-sm">{SCHOOL_LOCATION.radiusMeters} Meter</div>
            <p className="text-gray-600 leading-relaxed font-medium">
              Pengawas di luar radius {SCHOOL_LOCATION.radiusMeters}m akan menerima notifikasi peringatan dan presensi diblokir. Administrator memiliki hak bypass untuk verifikasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
