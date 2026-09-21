import React, { useState, useMemo, useEffect } from 'react';
import { JadwalItem, StatusKehadiran, UserSession, ExamTimeSettings } from '../types';
import { submitCheckin } from '../services/api';
import { checkExamLockStatus, getCurrentSessionStatus, getSessionTimeRange } from '../data/schedule';
import { LocationStatusCard } from './LocationStatusCard';
import {
  LocationCheckResult,
  SCHOOL_LOCATION,
  calculateDistanceMeters,
} from '../utils/geolocation';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Lock,
  ShieldCheck,
  Timer,
  AlertOctagon,
  Navigation
} from 'lucide-react';
import ReminderCard from './ReminderCard';

interface PresensiTabProps {
  session: UserSession;
  jadwalList: JadwalItem[];
  currentTime: Date;
  settings: ExamTimeSettings;
  onPresensiSuccess?: () => void;
}

const STATUS_OPTIONS: { label: string; value: StatusKehadiran; color: string }[] = [
  { label: 'HADIR', value: 'HADIR', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
  { label: 'IZIN', value: 'IZIN', color: 'text-blue-700 bg-blue-50 border-blue-300' },
  { label: 'SAKIT', value: 'SAKIT', color: 'text-amber-700 bg-amber-50 border-amber-300' },
  { label: 'ALPA', value: 'ALPA', color: 'text-rose-700 bg-rose-50 border-rose-300' },
  { label: 'DIGANTIKAN', value: 'DIGANTIKAN', color: 'text-purple-700 bg-purple-50 border-purple-300' },
];

export const PresensiTab: React.FC<PresensiTabProps> = ({
  session,
  jadwalList,
  currentTime,
  settings,
  onPresensiSuccess,
}) => {
  const lockInfo = checkExamLockStatus(currentTime, settings);
  const sessionStatus = getCurrentSessionStatus(currentTime);
  const isLockedForUser = lockInfo.isLocked && !session.isAdmin;

  // Geolocation state
  const [locationStatus, setLocationStatus] = useState<LocationCheckResult>({
    isChecking: false,
    hasChecked: false,
    isInRadius: false,
    gpsActive: false,
    distanceMeters: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    errorMessage: null,
  });

  const checkUserLocation = (): Promise<LocationCheckResult> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const res: LocationCheckResult = {
          isChecking: false,
          hasChecked: true,
          isInRadius: false,
          gpsActive: false,
          distanceMeters: null,
          latitude: null,
          longitude: null,
          accuracy: null,
          errorMessage: 'Peramban tidak mendukung fitur Geolocation / GPS.',
        };
        setLocationStatus(res);
        resolve(res);
        return;
      }

      setLocationStatus((prev) => ({ ...prev, isChecking: true }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          const dist = calculateDistanceMeters(
            userLat,
            userLon,
            SCHOOL_LOCATION.latitude,
            SCHOOL_LOCATION.longitude
          );
          const inRadius = dist <= SCHOOL_LOCATION.radiusMeters;

          const res: LocationCheckResult = {
            isChecking: false,
            hasChecked: true,
            isInRadius: inRadius,
            gpsActive: true,
            distanceMeters: dist,
            latitude: userLat,
            longitude: userLon,
            accuracy: position.coords.accuracy,
            errorMessage: null,
          };
          setLocationStatus(res);
          resolve(res);
        },
        (error) => {
          let msg = 'Gagal mendeteksi lokasi GPS.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Akses lokasi ditolak. Harap izinkan akses lokasi (GPS) pada peramban Anda untuk melakukan presensi.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Informasi lokasi tidak tersedia. Pastikan GPS/Location di perangkat Anda telah dihidupkan.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Waktu permintaan lokasi GPS habis. Silakan coba periksa lokasi kembali.';
          }

          const res: LocationCheckResult = {
            isChecking: false,
            hasChecked: true,
            isInRadius: false,
            gpsActive: false,
            distanceMeters: null,
            latitude: null,
            longitude: null,
            accuracy: null,
            errorMessage: msg,
          };
          setLocationStatus(res);
          resolve(res);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 10000,
        }
      );
    });
  };

  // Check location on initial mount so teacher immediately knows their GPS status
  useEffect(() => {
    checkUserLocation();
  }, []);

  // Determine day and date in Jakarta time
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

  const dayFormatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(currentTime);

  // Allow filter by date/day or view today's
  const [selectedDay, setSelectedDay] = useState<string>(hariIni);

  // Available days in the schedule
  const availableDays = useMemo(() => {
    const days = Array.from(new Set(jadwalList.map((j) => j.HARI)));
    return days.length > 0 ? days : ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
  }, [jadwalList]);

  // Schedules matching the selected day
  const filteredJadwal = useMemo(() => {
    return jadwalList.filter(
      (j) => j.HARI.trim().toUpperCase() === selectedDay.trim().toUpperCase()
    );
  }, [jadwalList, selectedDay]);

  // Active slot calculation based on current time
  const activeSlot = sessionStatus.activeSession;

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [status, setStatus] = useState<StatusKehadiran>('HADIR');
  const [pengganti, setPengganti] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedRow: JadwalItem | undefined = filteredJadwal[selectedIndex];

  const handleSave = async () => {
    if (!selectedRow) return;
    setFeedback(null);

    if (isLockedForUser) {
      setFeedback({
        type: 'error',
        text: `Presensi dikunci: ${lockInfo.reason} Hanya Administrator yang dapat mengisi atau mengubah presensi.`
      });
      return;
    }

    if (status === 'DIGANTIKAN' && !pengganti.trim()) {
      setFeedback({ type: 'error', text: 'Nama pengawas pengganti wajib diisi.' });
      return;
    }

    // GEOLOCATION CHECK ENFORCEMENT:
    // Bagi pengawas umum (bukan admin), sistem WAJIB memastikan GPS aktif dan posisi berada di lingkungan Pondok Modern Al-Ghozali.
    if (!session.isAdmin) {
      setSubmitting(true);
      const locRes = await checkUserLocation();
      
      if (!locRes.gpsActive) {
        setSubmitting(false);
        setFeedback({
          type: 'error',
          text: 'PERINGATAN: GPS BELUM DIAKTIFKAN. Harap hidupkan GPS/Lokasi perangkat Anda dan izinkan akses lokasi di browser untuk melanjutkan presensi.'
        });
        return;
      }

      if (!locRes.isInRadius) {
        setSubmitting(false);
        const distInfo = locRes.distanceMeters
          ? locRes.distanceMeters > 1000
            ? `${(locRes.distanceMeters / 1000).toFixed(1)} km`
            : `${locRes.distanceMeters} meter`
          : 'jauh';
        setFeedback({
          type: 'error',
          text: `PERINGATAN: ANDA BERADA DI LUAR LOKASI RESMI (${distInfo} dari Pondok Modern Al-Ghozali). Presensi hanya dapat dilakukan di lingkungan Pondok Modern Al-Ghozali, Jl. Permata No. 19 RT 006 RW 005 Curug, Gunung Sindur, Bogor.`
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await submitCheckin({
        unit: session.unit,
        nama: session.nama,
        tanggal: selectedRow.TANGGAL,
        hari: selectedRow.HARI,
        jam_ke: selectedRow.JAM_KE,
        ruang: selectedRow.RUANG,
        status,
        pengganti: pengganti.trim(),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: res.message || 'Presensi berhasil disimpan.' });
        if (onPresensiSuccess) onPresensiSuccess();
      } else {
        setFeedback({ type: 'error', text: res.message || 'Presensi gagal disimpan.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lock banner if locked */}
      {isLockedForUser && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-start gap-3 shadow-xs">
          <Lock className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1.5">
            <strong className="block text-sm font-black text-rose-950 tracking-wide">
              WAKTU UJIAN SELESAI / SISTEM TERKUNCI
            </strong>
            <p className="font-bold text-rose-800">{lockInfo.reason}</p>
            <div className="p-2.5 bg-white/90 rounded-lg border border-rose-200 text-2xs font-bold text-rose-900 leading-relaxed">
              PENGAWAS TIDAK DIIZINKAN MASUK ATAU MENGIRIM PRESENSI SETELAH WAKTU UJIAN BERAKHIR. BILA TERKENDALA LOGIN SILAKAN HUBUNGI ADMINISTRATOR ATAU PANITIA UJIAN.
            </div>
          </div>
        </div>
      )}

      {session.isAdmin && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>Mode Administrator:</strong> Anda memiliki hak bypass penguncian jam digital dan bypass validasi geofencing lokasi untuk kebutuhan verifikasi panitia.
          </span>
        </div>
      )}

      {/* Geofence & GPS Location Validation Card */}
      <LocationStatusCard
        locationStatus={locationStatus}
        onRefreshLocation={checkUserLocation}
        isAdmin={session.isAdmin}
      />
      {/* Header bar with time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Input Kehadiran</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>
              Waktu Jakarta: <strong>{currentTime.toLocaleTimeString('id-ID')} WIB</strong> · {hariIni}, {dayFormatted}
            </span>
          </div>
        </div>

        {/* Day selection tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
          {availableDays.map((d) => (
            <button
              key={d}
              onClick={() => {
                setSelectedDay(d);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedDay === d
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Active slot indicator */}
      {activeSlot && selectedDay === hariIni && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <div>
              <div className="font-bold text-sm text-emerald-950">
                JADWAL SEDANG BERLANGSUNG: JAM KE-{activeSlot}
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                Waktu Pelaksanaan: <strong>{getSessionTimeRange(activeSlot)}</strong>
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
            <Timer className="w-3 h-3" /> Sesi Sedang Berjalan
          </span>
        </div>
      )}

      {filteredJadwal.length === 0 ? (
        <div className="p-8 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-gray-700 font-medium">
            Tidak ada jadwal pengawasan Anda pada hari {selectedDay}.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Silakan pilih hari lain pada tombol di atas untuk melihat jadwal hari berikutnya.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Jadwal selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="select-jadwal">
              Pilih Ruang & Jam Jadwal
            </label>
            <select
              id="select-jadwal"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            >
              {filteredJadwal.map((item, idx) => {
                const timeRange = getSessionTimeRange(item.JAM_KE);
                return (
                  <option key={`${item.RUANG}-${item.JAM_KE}-${idx}`} value={idx}>
                    Ruang {item.RUANG} · Jam {item.JAM_KE} ({timeRange || 'Sesi Ujian'}) · {item.HARI} ({item.TANGGAL})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Schedule Detail Card */}
          {selectedRow && (
            <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-b border-gray-100 text-sm">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Ruang</span>
                  <span className="font-bold text-gray-900 text-base">Ruang {selectedRow.RUANG}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Jam Ke & Waktu</span>
                  <span className="font-bold text-emerald-700 text-base block">Jam {selectedRow.JAM_KE}</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {getSessionTimeRange(selectedRow.JAM_KE)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Hari / Tanggal</span>
                  <span className="font-medium text-gray-800">{selectedRow.HARI}, {selectedRow.TANGGAL}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Pengawas Terjadwal</span>
                  <span className="font-medium text-gray-800">{selectedRow.NAMA_PENGAWAS}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Kehadiran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-center p-2.5 border rounded-lg cursor-pointer text-xs font-bold transition-all text-center ${
                        status === opt.value
                          ? `${opt.color} ring-2 ring-emerald-600 ring-offset-1`
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status_presensi"
                        value={opt.value}
                        checked={status === opt.value}
                        onChange={() => setStatus(opt.value)}
                        className="sr-only"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pengganti Input if DIGANTIKAN */}
              {status === 'DIGANTIKAN' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <label className="block text-xs font-semibold text-purple-900 mb-1" htmlFor="input-pengganti">
                    Nama Pengawas Pengganti *
                  </label>
                  <input
                    id="input-pengganti"
                    type="text"
                    value={pengganti}
                    onChange={(e) => setPengganti(e.target.value)}
                    placeholder="Masukkan nama guru/pengawas pengganti..."
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Feedback alert */}
              {feedback && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                id="btn-simpan-presensi"
                onClick={handleSave}
                disabled={submitting || isLockedForUser}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-lg text-sm transition-all duration-150 shadow-sm ${
                  isLockedForUser
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan Presensi...
                  </>
                ) : isLockedForUser ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Presensi Terkunci (Waktu Selesai)
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Simpan Presensi
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Official Exam Reminder & SOP Card with Direct Google Form Berita Acara Link */}
      <ReminderCard />
    </div>
  );
};
