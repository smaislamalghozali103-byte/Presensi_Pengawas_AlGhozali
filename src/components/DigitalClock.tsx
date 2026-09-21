import React from 'react';
import { ExamTimeSettings } from '../types';
import { checkExamLockStatus, getCurrentSessionStatus, EXAM_SESSION_SCHEDULE } from '../data/schedule';
import { Clock, ShieldAlert, ShieldCheck, Lock, Unlock, Timer } from 'lucide-react';

interface DigitalClockProps {
  currentTime: Date;
  settings: ExamTimeSettings;
  isAdmin?: boolean;
  compact?: boolean;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({
  currentTime,
  settings,
  isAdmin = false,
  compact = false,
}) => {
  const lockInfo = checkExamLockStatus(currentTime, settings);
  const sessionStatus = getCurrentSessionStatus(currentTime);

  // Day and date in Jakarta format
  const hariMap: Record<string, string> = {
    Monday: 'SENIN',
    Tuesday: 'SELASA',
    Wednesday: 'RABU',
    Thursday: 'KAMIS',
    Friday: 'JUMAT',
    Saturday: 'SABTU',
    Sunday: 'MINGGU',
  };

  const weekdayName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  }).format(currentTime);
  const hariIni = hariMap[weekdayName] || 'SENIN';

  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime);

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-xs">
        <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-bold tracking-wider">{lockInfo.jakartaTimeStr} WIB</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-300 font-sans">{hariIni}</span>
        <span className="text-gray-400">|</span>
        {sessionStatus.activeSession ? (
          <span className="text-emerald-400 font-sans font-semibold">
            Jam {sessionStatus.activeSession}
          </span>
        ) : lockInfo.statusBadge === 'OPEN' ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-sans font-semibold">
            <Unlock className="w-3 h-3" /> Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-400 font-sans font-semibold">
            <Lock className="w-3 h-3" /> {isAdmin ? 'Bypass' : 'Terkunci'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      id="digital-clock-panel"
      className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        lockInfo.statusBadge === 'OPEN'
          ? 'bg-gradient-to-br from-gray-900 to-slate-900 text-white border-emerald-500/40 shadow-md'
          : 'bg-gradient-to-br from-slate-900 to-zinc-900 text-white border-rose-500/40 shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
        {/* Left: Time and Date */}
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 tracking-wider uppercase mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jam Digital Resmi Pengawasan (WIB)</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              {lockInfo.jakartaTimeStr}
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">WIB</span>
          </div>

          <div className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
            {hariIni}, {dateFormatted}
          </div>
        </div>

        {/* Right: Status Pill & Lock state */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="flex items-center gap-2">
            {lockInfo.statusBadge === 'OPEN' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                SESI UJIAN AKTIF
              </span>
            ) : lockInfo.statusBadge === 'LOCKED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 border border-rose-400/50 text-rose-300">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                WAKTU UJIAN SELESAI / TERKUNCI
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-400/50 text-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                BELUM DIMULAI
              </span>
            )}

            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-purple-500/30 text-purple-200 border border-purple-400/50 uppercase tracking-wide">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          <p className="text-2xs sm:text-xs text-gray-300 sm:text-right max-w-xs">
            {lockInfo.reason}
          </p>

          {lockInfo.isLocked && !isAdmin && (
            <div className="flex items-center gap-1 text-2xs font-semibold text-rose-400 sm:justify-end">
              <ShieldAlert className="w-3 h-3 flex-shrink-0" />
              <span>Pengawas tidak dapat masuk / presensi dikunci.</span>
            </div>
          )}

          {isAdmin && lockInfo.isLocked && (
            <div className="flex items-center gap-1 text-2xs font-semibold text-emerald-400 sm:justify-end">
              <Unlock className="w-3 h-3 flex-shrink-0" />
              <span>Akses Administrator aktif (Kunci dibypass).</span>
            </div>
          )}
        </div>
      </div>

      {/* Official Exam Session Time Breakdown */}
      <div className="mt-3 pt-1">
        <div className="flex items-center justify-between text-2xs text-gray-400 mb-2">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1 text-gray-300">
            <Timer className="w-3 h-3 text-emerald-400" /> Jadwal Waktu Sesi Ujian PTS Ganjil:
          </span>
          <span className="text-emerald-400 font-medium">
            {sessionStatus.message}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Jam 1 */}
          <div
            className={`px-3 py-2 rounded-xl border transition-all ${
              sessionStatus.activeSession === 'I'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-sm ring-1 ring-emerald-400/50'
                : 'bg-gray-800/60 border-gray-700/60 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">⏳ Jam ke-1</span>
              {sessionStatus.activeSession === 'I' && (
                <span className="px-1.5 py-0.5 rounded text-3xs font-extrabold bg-emerald-500 text-black uppercase">
                  Aktif
                </span>
              )}
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
              07.30 - 09.00 WIB
            </div>
          </div>

          {/* Jam 2 */}
          <div
            className={`px-3 py-2 rounded-xl border transition-all ${
              sessionStatus.activeSession === 'II'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-sm ring-1 ring-emerald-400/50'
                : 'bg-gray-800/60 border-gray-700/60 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">⏳ Jam ke-2</span>
              {sessionStatus.activeSession === 'II' && (
                <span className="px-1.5 py-0.5 rounded text-3xs font-extrabold bg-emerald-500 text-black uppercase">
                  Aktif
                </span>
              )}
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
              09.15 - 10.45 WIB
            </div>
          </div>

          {/* Jam 3 */}
          <div
            className={`px-3 py-2 rounded-xl border transition-all ${
              sessionStatus.activeSession === 'III'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-sm ring-1 ring-emerald-400/50'
                : 'bg-gray-800/60 border-gray-700/60 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">⏳ Jam ke-3</span>
              {sessionStatus.activeSession === 'III' && (
                <span className="px-1.5 py-0.5 rounded text-3xs font-extrabold bg-emerald-500 text-black uppercase">
                  Aktif
                </span>
              )}
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
              11.00 - 12.30 WIB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
