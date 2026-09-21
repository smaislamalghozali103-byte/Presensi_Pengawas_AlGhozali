/**
 * Konfigurasi Geofencing & Lokasi Resmi:
 * PONDOK MODERN AL-GHOZALI
 * Jl. Permata No. 19 RT 006 RW 005, Desa Curug, Kecamatan Gunung Sindur, Kabupaten Bogor, Jawa Barat.
 */
export const SCHOOL_LOCATION = {
  name: 'Pondok Modern Al-Ghozali',
  address: 'Jl. Permata No. 19 RT 006 RW 005 Desa Curug, Kec. Gunung Sindur, Kab. Bogor',
  // Koordinat kampus Al-Ghozali di Gunung Sindur, Kab. Bogor
  latitude: -6.39420,
  longitude: 106.72090,
  // Radius batas toleransi di area pondok & sekolah (dalam meter): 250 meter (cukup luas mencakup gerbang, gedung SMA, SMP, asrama, dan ruang ujian)
  radiusMeters: 250,
};

export interface LocationCheckResult {
  isChecking: boolean;
  hasChecked: boolean;
  isInRadius: boolean;
  gpsActive: boolean;
  distanceMeters: number | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  errorMessage: string | null;
}

/**
 * Menghitung jarak antara 2 koordinat dengan formula Haversine (hasil dalam meter).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
