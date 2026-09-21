import { RekapItem, UnitSekolah } from '../types';
import { scheduleRows } from '../data/schedule';

/**
 * Builds full attendance recap for an entire school unit (SMA or SMP)
 * by merging official master schedules with real recorded checkins.
 */
export function getFullUnitRekap(unit: UnitSekolah): RekapItem[] {
  const allSchedules = scheduleRows(unit);

  // Group schedules by pengawas name
  const scheduleMap = new Map<string, number>();
  allSchedules.forEach((item) => {
    const name = item.NAMA_PENGAWAS.trim();
    if (name) {
      scheduleMap.set(name, (scheduleMap.get(name) || 0) + 1);
    }
  });

  const rekapList: RekapItem[] = [];

  // Iterate through all pengawas who have scheduled sessions in this unit
  scheduleMap.forEach((totalJadwal, nama) => {
    let stored: any[] = [];
    try {
      const key = `presensi_${unit}_${nama}`;
      stored = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (_) {}

    const counts = {
      HADIR: 0,
      IZIN: 0,
      SAKIT: 0,
      ALPA: 0,
      DIGANTIKAN: 0,
    };

    stored.forEach((item: any) => {
      const st = String(item.status || '').toUpperCase() as keyof typeof counts;
      if (counts[st] !== undefined) {
        counts[st]++;
      }
    });

    rekapList.push({
      'NAMA PENGAWAS': nama,
      UNIT: unit,
      'JUMLAH MENGAWAS': totalJadwal,
      HADIR: counts.HADIR,
      IZIN: counts.IZIN,
      SAKIT: counts.SAKIT,
      ALPA: counts.ALPA,
      DIGANTIKAN: counts.DIGANTIKAN,
    });
  });

  // Sort alphabetically by teacher name
  return rekapList.sort((a, b) => a['NAMA PENGAWAS'].localeCompare(b['NAMA PENGAWAS']));
}
