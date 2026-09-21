import React, { useState, useEffect, useCallback } from 'react';
import { UserSession, JadwalItem, ExamTimeSettings } from './types';
import { LoginScreen } from './components/LoginScreen';
import { PresensiTab } from './components/PresensiTab';
import { JadwalTab } from './components/JadwalTab';
import { RekapTab } from './components/RekapTab';
import { AdminTab } from './components/AdminTab';
import { DigitalClock } from './components/DigitalClock';
import { PWAInstallButton } from './components/PWAInstallButton';
import { getJadwalPengawas } from './services/api';
import { getExamSettings, saveExamSettings, SPREADSHEET_LINKS, checkExamLockStatus } from './data/schedule';
import {
  LogOut,
  ClipboardList,
  CalendarDays,
  BarChart2,
  School,
  Loader2,
  AlertCircle,
  WifiOff,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Settings,
  Lock,
  X
} from 'lucide-react';

export function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('pengawas_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [settings, setSettings] = useState<ExamTimeSettings>(() => getExamSettings());

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [activeTab, setActiveTab] = useState<'presensi' | 'jadwal' | 'rekap' | 'admin'>('presensi');
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState<boolean>(false);
  const [jadwalError, setJadwalError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [rekapRefreshTrigger, setRekapRefreshTrigger] = useState<number>(0);

  // Admin PIN Unlock Modal for switching into Admin Tab from user mode
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [modalPinInput, setModalPinInput] = useState<string>('');
  const [modalPinError, setModalPinError] = useState<string | null>(null);

  // Online / offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Live timer updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedule when logged in
  const loadJadwal = useCallback(async (currentSession: UserSession) => {
    // If admin is logged in as general administrator without specific schedule, still load unit rows
    setLoadingJadwal(true);
    setJadwalError(null);
    try {
      const res = await getJadwalPengawas(currentSession.unit, currentSession.nama);
      if (res.ok && res.data) {
        setJadwalList(res.data);
      } else {
        setJadwalError(res.message || 'Jadwal pengawas selesai dimuat.');
      }
    } catch (err: any) {
      setJadwalError(err.message || 'Gagal memuat jadwal pengawasan.');
    } finally {
      setLoadingJadwal(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      loadJadwal(session);
    }
  }, [session, loadJadwal]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    try {
      localStorage.setItem('pengawas_session', JSON.stringify(newSession));
    } catch (_) {}
    if (newSession.isAdmin) {
      setActiveTab('admin');
    } else {
      setActiveTab('presensi');
    }
  };

  const handleLogout = () => {
    setSession(null);
    try {
      localStorage.removeItem('pengawas_session');
    } catch (_) {}
  };

  const handleAdminTabClick = () => {
    if (session?.isAdmin) {
      setActiveTab('admin');
    } else {
      setModalPinInput('');
      setModalPinError(null);
      setShowAdminPinModal(true);
    }
  };

  const handleModalPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalPinInput === settings.adminPin) {
      setShowAdminPinModal(false);
      if (session) {
        const updatedSession = { ...session, isAdmin: true };
        setSession(updatedSession);
        try {
          localStorage.setItem('pengawas_session', JSON.stringify(updatedSession));
        } catch (_) {}
      }
      setActiveTab('admin');
    } else {
      setModalPinError('PIN Administrator tidak cocok.');
    }
  };

  const handleUpdateSettings = (newSettings: ExamTimeSettings) => {
    setSettings(newSettings);
    saveExamSettings(newSettings);
  };

  const offlineBanner = !isOnline && (
    <div
      id="offline-banner"
      role="alert"
      className="fixed bottom-0 inset-x-0 z-50 bg-amber-600 text-white shadow-lg px-4 py-2.5 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium transition-transform duration-300 ease-in-out border-t border-amber-500"
    >
      <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
      <span>
        <strong>Koneksi internet terputus.</strong> Mode offline aktif — data presensi Anda akan disimpan secara lokal.
      </span>
    </div>
  );

  if (!session) {
    return (
      <div className="relative min-h-screen">
        <LoginScreen
          onLogin={handleLogin}
          currentTime={currentTime}
          settings={settings}
        />
        {offlineBanner}
      </div>
    );
  }

  const lockInfo = checkExamLockStatus(currentTime, settings);

  return (
    <div className={`min-h-screen bg-gray-50/50 text-gray-900 flex flex-col ${!isOnline ? 'pb-11' : ''}`}>
      {/* Top Application Bar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl border border-emerald-200/80 shadow-2xs flex items-center justify-center">
              <img
                src="/logo-alghozali.svg"
                alt="Logo Al-Ghozali"
                className="w-8 h-9 sm:w-9 sm:h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Presensi Pengawas</h1>
                {session.isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium truncate max-w-xs sm:max-w-none">
                {session.unit} · {session.nama}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live compact digital clock on navbar */}
            <div className="hidden sm:block">
              <DigitalClock
                currentTime={currentTime}
                settings={settings}
                isAdmin={session.isAdmin}
                compact
              />
            </div>

            {/* Quick link to Spreadsheet (Admin only) */}
            {session.isAdmin && (
              <a
                href={SPREADSHEET_LINKS[session.unit].url}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Spreadsheet Pemantau"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Sheet {session.unit}
              </a>
            )}

            {/* PWA Install Button on Navbar */}
            <PWAInstallButton />

            <button
              onClick={handleLogout}
              id="btn-logout"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-red-700 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presensi')}
            id="tab-presensi"
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'presensi'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            📌 Presensi
          </button>
          <button
            onClick={() => setActiveTab('jadwal')}
            id="tab-jadwal"
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'jadwal'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            📅 Jadwal Saya
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            id="tab-rekap"
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'rekap'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            📊 Rekap
          </button>
          <button
            onClick={handleAdminTabClick}
            id="tab-admin"
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'border-purple-600 text-purple-700'
                : session.isAdmin
                ? 'border-transparent text-purple-600 hover:text-purple-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            ⚙️ Admin & Pemantau
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Full Digital Clock Panel in mobile or when in Presensi tab */}
        {activeTab === 'presensi' && (
          <DigitalClock
            currentTime={currentTime}
            settings={settings}
            isAdmin={session.isAdmin}
          />
        )}

        {loadingJadwal && jadwalList.length === 0 && activeTab !== 'admin' ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-gray-600">Memuat data jadwal pengawasan...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'presensi' && (
              <PresensiTab
                session={session}
                jadwalList={jadwalList}
                currentTime={currentTime}
                settings={settings}
                onPresensiSuccess={() => {
                  setRekapRefreshTrigger((t) => t + 1);
                  loadJadwal(session);
                }}
              />
            )}

            {activeTab === 'jadwal' && (
              <JadwalTab
                jadwalList={jadwalList}
                currentTime={currentTime}
                currentUnit={session.unit}
                currentNama={session.nama}
                onRefresh={() => loadJadwal(session)}
              />
            )}

            {activeTab === 'rekap' && (
              <RekapTab
                session={session}
                refreshTrigger={rekapRefreshTrigger}
              />
            )}

            {activeTab === 'admin' && (
              <AdminTab
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                currentUnit={session.unit}
              />
            )}
          </div>
        )}
      </main>

      {/* Admin PIN Unlock Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdminPinModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Akses Administrator</h3>
                <p className="text-xs text-gray-500">Masukkan PIN Admin untuk membuka panel ini.</p>
              </div>
            </div>

            {modalPinError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalPinError}</span>
              </div>
            )}

            <form onSubmit={handleModalPinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="modal-admin-pin">
                  PIN Administrator
                </label>
                <input
                  id="modal-admin-pin"
                  type="password"
                  value={modalPinInput}
                  onChange={(e) => setModalPinInput(e.target.value)}
                  placeholder="Ketik PIN (default: 123456)"
                  autoFocus
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Buka Panel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 bg-white text-center text-xs text-gray-500">
        Pondok Modern Al-Ghozali · Sistem Presensi Pengawas Ujian 2026/2027 v2.3.0
      </footer>

      {/* Persistent bottom offline banner */}
      {offlineBanner}
    </div>
  );
}

export default App;
