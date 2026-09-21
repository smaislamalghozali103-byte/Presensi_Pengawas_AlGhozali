import React from 'react';
import { LocationCheckResult, SCHOOL_LOCATION } from '../utils/geolocation';
import {
  MapPin,
  AlertOctagon,
  CheckCircle2,
  Navigation,
  RefreshCw,
  Info,
  Compass
} from 'lucide-react';

interface LocationStatusCardProps {
  locationStatus: LocationCheckResult;
  onRefreshLocation: () => void;
  isAdmin?: boolean;
}

export const LocationStatusCard: React.FC<LocationStatusCardProps> = ({
  locationStatus,
  onRefreshLocation,
  isAdmin = false,
}) => {
  const {
    isChecking,
    hasChecked,
    isInRadius,
    gpsActive,
    distanceMeters,
    accuracy,
    errorMessage,
  } = locationStatus;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl flex items-center justify-center ${
              !hasChecked
                ? 'bg-gray-100 text-gray-600'
                : !gpsActive
                ? 'bg-amber-100 text-amber-800'
                : isInRadius
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Validasi Lokasi Pengawas
              {hasChecked && gpsActive && (
                <span
                  className={`text-3xs px-2 py-0.5 rounded-full font-bold uppercase ${
                    isInRadius
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {isInRadius ? 'Di Lingkungan Al-Ghozali' : 'Di Luar Radius'}
                </span>
              )}
            </h4>
            <p className="text-2xs text-gray-500 font-medium mt-0.5">
              {SCHOOL_LOCATION.name} · {SCHOOL_LOCATION.address}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefreshLocation}
          disabled={isChecking}
          id="btn-refresh-location"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors border border-gray-200 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{isChecking ? 'Mendeteksi GPS...' : 'Periksa Lokasi GPS'}</span>
        </button>
      </div>

      {/* State 1: GPS Belum Aktif / Ditolak / Belum Diizinkan */}
      {hasChecked && !gpsActive && (
        <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-xl text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-amber-950 font-bold text-sm">
                PERINGATAN: GPS BELUM AKTIF / AKSES LOKASI DITOLAK
              </strong>
              <p className="text-amber-800 font-medium">
                {errorMessage || 'Sistem tidak dapat mendeteksi koordinat Anda. Harap aktifkan GPS (Location Service) pada perangkat smartphone/laptop Anda dan berikan izin akses lokasi peramban.'}
              </p>
            </div>
          </div>
          <div className="pt-1.5 pl-7 flex flex-wrap gap-2 text-2xs font-semibold text-amber-900">
            <span className="inline-flex items-center gap-1 bg-white/90 px-2 py-1 rounded border border-amber-300">
              <Navigation className="w-3 h-3 text-amber-700" />
              1. Aktifkan GPS / Lokasi di Pengaturan HP/Laptop
            </span>
            <span className="inline-flex items-center gap-1 bg-white/90 px-2 py-1 rounded border border-amber-300">
              <Compass className="w-3 h-3 text-amber-700" />
              2. Klik Izinkan (Allow) Akses Lokasi di Browser
            </span>
          </div>
        </div>
      )}

      {/* State 2: GPS Aktif TAPI Di Luar Radius Sekolah */}
      {hasChecked && gpsActive && !isInRadius && (
        <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-rose-950 font-bold text-sm">
                PERINGATAN: PENGAWAS BERADA DI LUAR LOKASI RESMI
              </strong>
              <p className="text-rose-800 font-semibold leading-relaxed">
                Anda terdeteksi berada sekitar <strong>{distanceMeters ? (distanceMeters > 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} meter`) : 'jauh'}</strong> dari kampus Pondok Modern Al-Ghozali (Batas radius: {SCHOOL_LOCATION.radiusMeters} meter).
              </p>
              <p className="text-rose-700 text-2xs">
                Sesuai peraturan, pengawas harus hadir secara fisik di lingkungan <strong>Pondok Modern Al-Ghozali, Jl. Permata No. 19 RT 006 RW 005 Desa Curug, Kec. Gunung Sindur, Kab. Bogor</strong> untuk dapat menyimpan kehadiran.
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="pl-7 pt-1">
              <span className="inline-block px-2 py-1 bg-white border border-rose-300 text-rose-900 font-bold text-2xs rounded">
                Mode Administrator: Pengisian presensi tetap diizinkan untuk keperluan verifikasi/pemantauan panitia.
              </span>
            </div>
          )}
        </div>
      )}

      {/* State 3: GPS Aktif dan Berada di Lingkungan Sekolah */}
      {hasChecked && gpsActive && isInRadius && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="text-emerald-950">
              <span className="font-bold">Posisi Terverifikasi di Lingkungan Sekolah:</span>{' '}
              <span className="text-emerald-800">
                Berada dalam radius kampus ({distanceMeters !== null ? `${distanceMeters} m dari titik pusat` : 'terverifikasi'}).
              </span>
            </div>
          </div>
          {accuracy && (
            <span className="text-3xs text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono hidden sm:inline">
              Akurasi GPS: ±{Math.round(accuracy)}m
            </span>
          )}
        </div>
      )}

      {/* State 4: Belum pernah diperiksa */}
      {!hasChecked && !isChecking && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs flex items-center justify-between gap-2 text-gray-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span>
              Sistem akan memvalidasi posisi GPS Anda saat menyimpan presensi untuk memastikan kehadiran di area kampus Al-Ghozali.
            </span>
          </div>
          <button
            type="button"
            onClick={onRefreshLocation}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold whitespace-nowrap"
          >
            Cek Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
