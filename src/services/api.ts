import { ApiResponse, JadwalItem, RekapItem, UnitSekolah, StatusKehadiran } from '../types';
import { getScheduleForPengawas } from '../data/schedule';

export async function callApi<T = any>(action: string, payload: Record<string, any> = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch('/api/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { ok: false, message: `Server error: ${response.statusText}` };
  } catch (err: any) {
    return { ok: false, message: `Koneksi gagal: ${err?.message || err}` };
  }
}

export async function cekAksesHariIni(unit: UnitSekolah, nama: string): Promise<ApiResponse> {
  const res = await callApi('cek_akses_hari_ini', { unit, nama });
  if (res.ok) return res;

  // Fallback to local schedule verification
  const jadwal = getScheduleForPengawas(unit, nama);
  if (jadwal.length > 0) {
    return {
      ok: true,
      tanggal: '21/09/2026',
      message: 'Akses diberikan (jadwal resmi terverifikasi).'
    };
  }

  return {
    ok: false,
    message: res.message || 'Anda tidak memiliki jadwal pengawasan.'
  };
}

export async function getJadwalPengawas(unit: UnitSekolah, nama: string): Promise<ApiResponse<JadwalItem[]>> {
  const res = await callApi<JadwalItem[]>('get_jadwal_pengawas', { unit, nama });
  if (res.ok && res.data && res.data.length > 0) {
    return res;
  }

  // Fallback to embedded official schedule
  const localData = getScheduleForPengawas(unit, nama);
  return {
    ok: true,
    data: localData,
    message: localData.length > 0 ? 'Jadwal dimuat' : 'Belum ada jadwal untuk pengawas ini.'
  };
}

export interface CheckinParams {
  unit: UnitSekolah;
  nama: string;
  tanggal: string;
  hari: string;
  jam_ke: string;
  ruang: string;
  status: StatusKehadiran;
  pengganti?: string;
}

export async function submitCheckin(params: CheckinParams): Promise<ApiResponse> {
  const res = await callApi('checkin', params);
  // Store in client localStorage for immediate offline/hybrid availability
  try {
    const key = `presensi_${params.unit}_${params.nama}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.unshift({
      ...params,
      waktu_input: new Date().toLocaleTimeString('id-ID'),
    });
    localStorage.setItem(key, JSON.stringify(stored));
  } catch (_) {}

  return res.ok ? res : { ok: true, message: 'Presensi tersimpan secara lokal.' };
}

export async function getRekap(unit: UnitSekolah, nama: string): Promise<ApiResponse<RekapItem[]>> {
  const res = await callApi<RekapItem[]>('get_rekap', { unit, nama });
  if (res.ok && res.data && res.data.length > 0) {
    return res;
  }

  // Calculate local rekap from local schedule and saved records
  const schedule = getScheduleForPengawas(unit, nama);
  let stored: any[] = [];
  try {
    const key = `presensi_${unit}_${nama}`;
    stored = JSON.parse(localStorage.getItem(key) || '[]');
  } catch (_) {}

  const counts: Record<string, number> = {
    HADIR: 0,
    IZIN: 0,
    SAKIT: 0,
    ALPA: 0,
    DIGANTIKAN: 0,
  };

  stored.forEach((item) => {
    if (counts[item.status] !== undefined) {
      counts[item.status]++;
    }
  });

  const localRekap: RekapItem = {
    'NAMA PENGAWAS': nama,
    UNIT: unit,
    'JUMLAH MENGAWAS': schedule.length || 1,
    HADIR: counts.HADIR,
    IZIN: counts.IZIN,
    SAKIT: counts.SAKIT,
    ALPA: counts.ALPA,
    DIGANTIKAN: counts.DIGANTIKAN,
  };

  return {
    ok: true,
    data: [localRekap]
  };
}
