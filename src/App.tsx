import React, { useState, useEffect, useCallback } from 'react';
import { UserSession, JadwalItem } from './types';
import { LoginScreen } from './components/LoginScreen';
import { PresensiTab } from './components/PresensiTab';
import { JadwalTab } from './components/JadwalTab';
import { RekapTab } from './components/RekapTab';
import { getJadwalPengawas } from './services/api';
import { LogOut, ClipboardList, CalendarDays, BarChart2, School, Loader2, AlertCircle } from 'lucide-react';

export function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('pengawas_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'presensi' | 'jadwal' | 'rekap'>('presensi');
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState<boolean>(false);
  const [jadwalError, setJadwalError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [rekapRefreshTrigger, setRekapRefreshTrigger] = useState<number>(0);

  // Live timer updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedule when logged in
  const loadJadwal = useCallback(async (currentSession: UserSession) => {
    setLoadingJadwal(true);
    setJadwalError(null);
    try {
      const res = await getJadwalPengawas(currentSession.unit, currentSession.nama);
      if (res.ok && res.data) {
        setJadwalList(res.data);
      } else {
        setJadwalError(res.message || 'Jadwal gagal dimuat.');
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

  // Periodic background check every 15 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      // Periodic ping
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, [session]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    try {
      localStorage.setItem('pengawas_session', JSON.stringify(newSession));
    } catch (_) {}
  };

  const handleLogout = () => {
    setSession(null);
    try {
      localStorage.removeItem('pengawas_session');
    } catch (_) {}
  };

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top Application Bar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Presensi Pengawas</h1>
              <p className="text-xs text-gray-500 font-medium">
                {session.unit} · {session.nama}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            id="btn-logout"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-red-700 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('presensi')}
            id="tab-presensi"
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
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
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
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
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'rekap'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            📊 Rekap
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {loadingJadwal && jadwalList.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-gray-600">Memuat data jadwal pengawasan...</p>
          </div>
        ) : jadwalError && jadwalList.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Informasi Jadwal</p>
              <p className="text-xs mt-0.5">{jadwalError}</p>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'presensi' && (
              <PresensiTab
                session={session}
                jadwalList={jadwalList}
                currentTime={currentTime}
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
                onRefresh={() => loadJadwal(session)}
              />
            )}

            {activeTab === 'rekap' && (
              <RekapTab
                session={session}
                refreshTrigger={rekapRefreshTrigger}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 bg-gray-50 text-center text-xs text-gray-500">
        Pondok Modern Al-Ghozali · Sistem Presensi Pengawas Ujian 2026/2027 v2.3.0
      </footer>
    </div>
  );
}

export default App;
