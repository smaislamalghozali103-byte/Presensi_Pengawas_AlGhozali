export type UnitSekolah = 'SMA' | 'SMP';

export type StatusKehadiran = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA' | 'DIGANTIKAN';

export interface JadwalItem {
  UNIT: string;
  TANGGAL: string;
  HARI: string;
  JAM_KE: string;
  RUANG: string;
  NAMA_PENGAWAS: string;
  _jam?: number;
}

export interface PresensiRecord {
  id?: string;
  tanggal_hari: string;
  nama_pengawas: string;
  pengawas_pengganti: string;
  ruang: string;
  jam_ke: string;
  jumlah_mengawas: number;
  status: StatusKehadiran;
  waktu_input: string;
}

export interface RekapItem {
  'NAMA PENGAWAS': string;
  UNIT: string;
  'JUMLAH MENGAWAS': number | string;
  HADIR: number | string;
  IZIN: number | string;
  SAKIT: number | string;
  ALPA: number | string;
  DIGANTIKAN: number | string;
}

export interface UserSession {
  unit: UnitSekolah;
  nama: string;
  accessDate?: string;
  isAdmin?: boolean;
}

export type LockMode = 'AUTO' | 'FORCE_LOCKED' | 'FORCE_OPEN';

export interface ExamTimeSettings {
  startTime: string; // e.g. "07:00"
  endTime: string;   // e.g. "13:00"
  lockMode: LockMode;
  adminPin: string;  // e.g. "123456"
}

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
  tanggal?: string;
  waktu_input?: string;
}
