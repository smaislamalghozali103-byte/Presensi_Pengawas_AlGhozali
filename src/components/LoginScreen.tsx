import React, { useState } from 'react';
import { UnitSekolah, UserSession, ExamTimeSettings } from '../types';
import { MASTER_PENGAWAS, checkExamLockStatus } from '../data/schedule';
import { cekAksesHariIni } from '../services/api';
import { DigitalClock } from './DigitalClock';
import { PWAInstallButton } from './PWAInstallButton';
import {
  School,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
  currentTime: Date;
  settings: ExamTimeSettings;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, currentTime, settings }) => {
  const [loginRole, setLoginRole] = useState<'pengawas' | 'admin'>('pengawas');
  const [unit, setUnit] = useState<UnitSekolah>('SMA');
  const [nama, setNama] = useState<string>(MASTER_PENGAWAS[0]);
  const [adminPin, setAdminPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lockInfo = checkExamLockStatus(currentTime, settings);

  const handlePengawasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // CRITICAL: Lock enforcement for regular supervisors
    if (lockInfo.isLocked) {
      setErrorMsg(
        `⛔ WAKTU UJIAN SELESAI / SISTEM TERKUNCI: ${lockInfo.reason} PENGAWAS TIDAK DIIZINKAN MASUK SETELAH WAKTU UJIAN BERAKHIR. BILA TERKENDALA LOGIN SILAKAN HUBUNGI ADMINISTRATOR ATAU PANITIA UJIAN.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await cekAksesHariIni(unit, nama);
      if (res.ok) {
        onLogin({
          unit,
          nama,
          isAdmin: false,
          accessDate: res.tanggal || '21/09/2026',
        });
      } else {
        setErrorMsg(res.message || 'Anda tidak memiliki jadwal pengawasan hari ini.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kendala saat memeriksa akses.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (adminPin !== settings.adminPin) {
      setErrorMsg('PIN Administrator salah. Silakan coba lagi (Default PIN: 123456).');
      return;
    }

    onLogin({
      unit,
      nama: 'Administrator Al-Ghozali',
      isAdmin: true,
      accessDate: new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(currentTime),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100/70">
      <div className="w-full max-w-lg space-y-4 my-6">
        {/* JAM DIGITAL RESMI DENGAN STATUS KUNCI */}
        <DigitalClock currentTime={currentTime} settings={settings} />

        {/* Card Login */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <img
                src="/logo-alghozali.svg"
                alt="Logo Resmi YPI Al-Ghozali"
                className="w-20 h-24 object-contain drop-shadow-sm hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Presensi Pengawas Ujian</h1>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-0.5">
              Pondok Modern Al-Ghozali · Tahun Ajaran 2026–2027
            </p>
          </div>

          {/* Role Tabs: Pengawas vs Administrator */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginRole('pengawas');
                setErrorMsg(null);
              }}
              id="tab-role-pengawas"
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                loginRole === 'pengawas'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Pengawas Ujian
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('admin');
                setErrorMsg(null);
              }}
              id="tab-role-admin"
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                loginRole === 'admin'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Administrator (PIN)
            </button>
          </div>

          {/* Lock Alert for Pengawas */}
          {loginRole === 'pengawas' && lockInfo.isLocked && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-start gap-3 shadow-xs">
              <Lock className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1.5">
                <strong className="block text-sm font-black text-rose-950 tracking-wide">
                  WAKTU UJIAN SELESAI / SISTEM TERKUNCI
                </strong>
                <p className="font-bold text-rose-800">
                  {lockInfo.reason}
                </p>
                <div className="p-2.5 bg-white/90 rounded-lg border border-rose-200 text-2xs font-bold text-rose-900 leading-relaxed">
                  PENGAWAS TIDAK DIIZINKAN MASUK SETELAH WAKTU UJIAN BERAKHIR. BILA TERKENDALA LOGIN SILAKAN HUBUNGI ADMINISTRATOR ATAU PANITIA UJIAN.
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* FORM PENGAWAS */}
          {loginRole === 'pengawas' && (
            <form onSubmit={handlePengawasSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="select-jenjang">
                  Jenjang Sekolah
                </label>
                <select
                  id="select-jenjang"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitSekolah)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                >
                  <option value="SMA">Jenjang SMA</option>
                  <option value="SMP">Jenjang SMP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="select-nama">
                  Nama Pengawas Terdaftar
                </label>
                <select
                  id="select-nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {MASTER_PENGAWAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                id="btn-login-pengawas"
                disabled={loading || lockInfo.isLocked}
                className={`w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  lockInfo.isLocked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memeriksa Akses Jadwal...
                  </>
                ) : lockInfo.isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Sistem Terkunci (Waktu Berakhir)
                  </>
                ) : (
                  <>
                    Masuk Presensi
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORM ADMINISTRATOR */}
          {loginRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  Administrator memiliki hak akses bypass untuk membuka sistem kapan saja, mengatur jam pengawasan, dan memantau spreadsheet.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="select-admin-unit">
                  Pilih Unit Pemantauan
                </label>
                <select
                  id="select-admin-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitSekolah)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="SMA">Jenjang SMA</option>
                  <option value="SMP">Jenjang SMP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="input-admin-pin">
                  PIN Administrator
                </label>
                <div className="relative">
                  <input
                    id="input-admin-pin"
                    type={showPin ? 'text' : 'password'}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Ketik PIN Admin (default: 123456)"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono tracking-wider pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-2xs text-gray-400 mt-1">Default PIN: <strong>123456</strong></p>
              </div>

              <button
                type="submit"
                id="btn-login-admin"
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Masuk Sebagai Administrator
              </button>
            </form>
          )}

          {/* Quick PWA Installation for Mobile / Desktop */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <PWAInstallButton variant="login" />
          </div>
        </div>
      </div>
    </div>
  );
};
