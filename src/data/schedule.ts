import { JadwalItem, UnitSekolah, ExamTimeSettings, SpreadsheetInfo } from '../types';

export const SPREADSHEET_LINKS: Record<UnitSekolah, SpreadsheetInfo> = {
  SMA: {
    id: '1C6C1pXqQFMc7EeML9sDTC1w32w6RfsP0upFwKgasr68',
    name: 'DAFTAR HADIR PENGAWAS ASTS GANJIL SMA',
    url: 'https://docs.google.com/spreadsheets/d/1C6C1pXqQFMc7EeML9sDTC1w32w6RfsP0upFwKgasr68/edit'
  },
  SMP: {
    id: '1WXd-WfnlFKegeHzyM6Uvqgu9Xmpsrv2vEebF8I9bhEM',
    name: 'DAFTAR HADIR PENGAWAS ASTS GANJIL SMP',
    url: 'https://docs.google.com/spreadsheets/d/1WXd-WfnlFKegeHzyM6Uvqgu9Xmpsrv2vEebF8I9bhEM/edit'
  }
};

export const DEFAULT_EXAM_SETTINGS: ExamTimeSettings = {
  startTime: '07:15',
  endTime: '12:45',
  lockMode: 'AUTO',
  adminPin: '123456',
};

export const BERITA_ACARA_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfLEXvB4IyRB05C7fufnhblWKIHTgRGRb7L7zguVouqwvQ2Vg/viewform?usp=publish-editor';

export const REMINDER_PENGAWAS_POINTS = [
  'Pengawas untuk memisahkan LJK perkelas dan mengurutkan LJK dari absen terkecil ke yang terbesar',
  'Lembar jawaban dimasukan ke map coklat',
  'Mengisi berita acara lewat link google form yang telah disediakan',
  'Menjaga kebersihan ruangan ujian',
  'Mengecek kembali lembar jawaban sebelum diserahkan ke panitia'
];

export interface SessionTimeDetail {
  jam: string;
  jamLabel: string;
  startTime: string;
  endTime: string;
  displayRange: string;
}

export const EXAM_SESSION_SCHEDULE: Record<string, SessionTimeDetail> = {
  'I': {
    jam: 'I',
    jamLabel: 'Jam ke-1',
    startTime: '07:30',
    endTime: '09:00',
    displayRange: '07.30 - 09.00 WIB'
  },
  'II': {
    jam: 'II',
    jamLabel: 'Jam ke-2',
    startTime: '09:15',
    endTime: '10:45',
    displayRange: '09.15 - 10.45 WIB'
  },
  'III': {
    jam: 'III',
    jamLabel: 'Jam ke-3',
    startTime: '11:00',
    endTime: '12:30',
    displayRange: '11.00 - 12.30 WIB'
  },
  '1': {
    jam: '1',
    jamLabel: 'Jam ke-1',
    startTime: '07:30',
    endTime: '09:00',
    displayRange: '07.30 - 09.00 WIB'
  },
  '2': {
    jam: '2',
    jamLabel: 'Jam ke-2',
    startTime: '09:15',
    endTime: '10:45',
    displayRange: '09.15 - 10.45 WIB'
  },
  '3': {
    jam: '3',
    jamLabel: 'Jam ke-3',
    startTime: '11:00',
    endTime: '12:30',
    displayRange: '11.00 - 12.30 WIB'
  }
};

export function getSessionTimeRange(jam: string): string {
  const norm = jam.trim().toUpperCase();
  if (EXAM_SESSION_SCHEDULE[norm]) {
    return EXAM_SESSION_SCHEDULE[norm].displayRange;
  }
  return '';
}

export function getCurrentSessionStatus(currentTime: Date): {
  activeSession: string | null;
  message: string;
  nextSession: string | null;
} {
  const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [hStr, mStr] = timeFormatter.format(currentTime).split(':');
  const totalMinutes = parseInt(hStr || '0', 10) * 60 + parseInt(mStr || '0', 10);

  // 07:30 = 450, 09:00 = 540, 09:15 = 555, 10:45 = 645, 11:00 = 660, 12:30 = 750
  if (totalMinutes < 450) {
    return {
      activeSession: null,
      message: 'Persiapan Ujian (Jam ke-1 dimulai 07.30 WIB)',
      nextSession: 'I'
    };
  } else if (totalMinutes >= 450 && totalMinutes < 540) {
    return {
      activeSession: 'I',
      message: 'Sedang Berlangsung: Jam ke-1 (07.30 - 09.00 WIB)',
      nextSession: 'II'
    };
  } else if (totalMinutes >= 540 && totalMinutes < 555) {
    return {
      activeSession: null,
      message: 'Istirahat / Transisi (Jam ke-2 mulai 09.15 WIB)',
      nextSession: 'II'
    };
  } else if (totalMinutes >= 555 && totalMinutes < 645) {
    return {
      activeSession: 'II',
      message: 'Sedang Berlangsung: Jam ke-2 (09.15 - 10.45 WIB)',
      nextSession: 'III'
    };
  } else if (totalMinutes >= 645 && totalMinutes < 660) {
    return {
      activeSession: null,
      message: 'Istirahat / Transisi (Jam ke-3 mulai 11.00 WIB)',
      nextSession: 'III'
    };
  } else if (totalMinutes >= 660 && totalMinutes < 750) {
    return {
      activeSession: 'III',
      message: 'Sedang Berlangsung: Jam ke-3 (11.00 - 12.30 WIB)',
      nextSession: null
    };
  } else {
    return {
      activeSession: null,
      message: 'Semua Sesi Ujian Hari Ini Telah Selesai (12.30 WIB)',
      nextSession: null
    };
  }
}

export function getExamSettings(): ExamTimeSettings {
  try {
    const saved = localStorage.getItem('exam_time_settings');
    if (saved) {
      return { ...DEFAULT_EXAM_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (_) {}
  return DEFAULT_EXAM_SETTINGS;
}

export function saveExamSettings(settings: ExamTimeSettings): void {
  try {
    localStorage.setItem('exam_time_settings', JSON.stringify(settings));
  } catch (_) {}
}

export function checkExamLockStatus(currentTime: Date, settings: ExamTimeSettings): {
  isLocked: boolean;
  reason: string;
  statusBadge: 'OPEN' | 'LOCKED' | 'NOT_STARTED';
  jakartaTimeStr: string;
} {
  // Format current Jakarta time
  const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const jakartaTimeStr = timeFormatter.format(currentTime);

  if (settings.lockMode === 'FORCE_OPEN') {
    return {
      isLocked: false,
      reason: 'SISTEM DIBUKA MANUAL OLEH ADMINISTRATOR.',
      statusBadge: 'OPEN',
      jakartaTimeStr,
    };
  }

  if (settings.lockMode === 'FORCE_LOCKED') {
    return {
      isLocked: true,
      reason: 'SISTEM TELAH DIKUNCI SECARA MANUAL OLEH ADMINISTRATOR.',
      statusBadge: 'LOCKED',
      jakartaTimeStr,
    };
  }

  // AUTO mode: check against startTime and endTime
  const parts = jakartaTimeStr.split(':');
  const curHours = parseInt(parts[0] || '0', 10);
  const curMinutes = parseInt(parts[1] || '0', 10);
  const currentTotalMinutes = curHours * 60 + curMinutes;

  const [startH, startM] = settings.startTime.split(':').map((v) => parseInt(v, 10));
  const startTotalMinutes = (startH || 7) * 60 + (startM || 0);

  const [endH, endM] = settings.endTime.split(':').map((v) => parseInt(v, 10));
  const endTotalMinutes = (endH || 13) * 60 + (endM || 0);

  if (currentTotalMinutes < startTotalMinutes) {
    return {
      isLocked: true,
      reason: `WAKTU UJIAN BELUM DIMULAI. AKSES PRESENSI DIBUKA PUKUL ${settings.startTime} WIB.`,
      statusBadge: 'NOT_STARTED',
      jakartaTimeStr,
    };
  }

  if (currentTotalMinutes >= endTotalMinutes) {
    return {
      isLocked: true,
      reason: `WAKTU UJIAN HARI INI TELAH SELESAI (BATAS: ${settings.endTime} WIB). AKSES PENGAWAS DIKUNCI.`,
      statusBadge: 'LOCKED',
      jakartaTimeStr,
    };
  }

  return {
    isLocked: false,
    reason: `SESI UJIAN SEDANG AKTIF (${settings.startTime} – ${settings.endTime} WIB).`,
    statusBadge: 'OPEN',
    jakartaTimeStr,
  };
}

export const MASTER_PENGAWAS: string[] = [
  "Abdul Fattah Azzam",
  "Abdul Hariz Naufal S.Ag",
  "Ade Ihsan Firdaus",
  "Ahdini Rahmatillah Lc. S.S",
  "Ahmad Hasan Munjaji",
  "Ahmad Lujaenilma, S.Kom",
  "Ahmad Sukanta, S.Pd",
  "Aini Syifa, S.S",
  "Alfi Nurfadilah",
  "Almaas Jhoung Asri",
  "Anisa Siti Nabilah, S.Pd",
  "Aulia Sabila Mufida",
  "Barirotul Choiriyah, S.E",
  "Bayu Nirpana, S.H., M.H",
  "Dea Amanda Putri",
  "Doni Subiyanto, S.E",
  "Fadhilah, S.Pd",
  "Fadilah Abidana, S.S.,M.Pd",
  "Fahru Roji Malik S.M",
  "Fathurachman, S.Pd",
  "Fiqih Kartika Murni, S.Pd",
  "Hammad Iyyad Faiji",
  "Hamzah Robani, S.Sos, L.c, M.Kom",
  "Ichsanul Afief, S.Sos",
  "Ilmi Miftahul Jannah",
  "Ir. Rachmawati, M.Pd",
  "Isnan Aprizal Hafizh",
  "Khairil Fahmi, S.Pd",
  "Lulu Zahrotunnisa, S.Pd",
  "M. Alief Nugraha, S.H",
  "M. Hanif Fauzi, M.Pd",
  "M. Hidayatu Rusydi, S.H",
  "M. Irham Al Baihaqi",
  "M. Jaelani Basri, S.Pd",
  "Moh Afriza Tri Wardana",
  "Muhamad Mashur",
  "Muhammad Akbar Al-Ghifari",
  "Muhammad Farid, S.Pd.I",
  "Muhammad Fikri Al-Anshory",
  "Muhammad Ihsan",
  "Muhammad Suhail, S.Pd.I",
  "Muhammad Zaki",
  "Nailul Kunni Fureida, S.Gz",
  "Nazwa Yunita",
  "Noor Faiz, S.Pd",
  "Nur Azizah, S.Pd",
  "Nurizal Muzaki",
  "Nurlaila, SM M.Pd",
  "Rahmati Kurrata'Aini, .S",
  "Rifqi Rahmatuloh",
  "Rizki Karomah, S.Si",
  "Sadam Hamzah, S.Hi",
  "Salwa Binta Tsania",
  "Silmi Sabila",
  "Siska Indriyani, S.Sos",
  "Siska Yunita Dewi",
  "Siti Fatimah Zahra",
  "Siti Halimah, S.Si., S.Pd",
  "Siti Nurzulfiah, S.Pd.I",
  "Subhan, S.Pd",
  "Syafon Oktavia Rahma",
  "Toni, S.Pd",
  "Venty Rahmawati, M.Pd",
  "Verary Pratama Putri S.E"
];

export const RAW_SCHEDULE_DATA: Record<UnitSekolah, string[]> = {
  SMA: [
    "1|Barirotul Choiriyah, S.E|Ir. Rachmawati, M.Pd|Ahdini Rahmatillah Lc. S.S|Verary Pratama Putri S.E|Nurlaila, SM M.Pd|Sadam Hamzah, S.Hi|Verary Pratama Putri S.E|Venty Rahmawati, M.Pd|Aini Syifa, S.S|Lulu Zahrotunnisa, S.Pd|Barirotul Choiriyah, S.E",
    "2|Lulu Zahrotunnisa, S.Pd|Barirotul Choiriyah, S.E|Barirotul Choiriyah, S.E|Ahdini Rahmatillah Lc. S.S|Venty Rahmawati, M.Pd|Nurlaila, SM M.Pd|Sadam Hamzah, S.Hi|Nurlaila, SM M.Pd|Venty Rahmawati, M.Pd|M. Hidayatu Rusydi, S.H|Lulu Zahrotunnisa, S.Pd",
    "3|Nailul Kunni Fureida, S.Gz|Lulu Zahrotunnisa, S.Pd|Nailul Kunni Fureida, S.Gz|Barirotul Choiriyah, S.E|Muhammad Suhail, S.Pd.I|Venty Rahmawati, M.Pd|Nurlaila, SM M.Pd|Ir. Rachmawati, M.Pd|Nurlaila, SM M.Pd|Muhammad Farid, S.Pd.I|M. Hidayatu Rusydi, S.H",
    "4|Rizki Karomah, S.Si|Nailul Kunni Fureida, S.Gz|Rizki Karomah, S.Si|Nailul Kunni Fureida, S.Gz|Verary Pratama Putri S.E|Muhammad Suhail, S.Pd.I|Venty Rahmawati, M.Pd|Rizki Karomah, S.Si|Ir. Rachmawati, M.Pd|Fadhilah, S.Pd|Muhammad Farid, S.Pd.I",
    "5|Ir. Rachmawati, M.Pd|Rizki Karomah, S.Si|Verary Pratama Putri S.E|Rizki Karomah, S.Si|Sadam Hamzah, S.Hi|Verary Pratama Putri S.E|Muhammad Suhail, S.Pd.I|Aini Syifa, S.S|Rizki Karomah, S.Si|Barirotul Choiriyah, S.E|Fadhilah, S.Pd",
    "6|Bayu Nirpana, S.H., M.H|Ichsanul Afief, S.Sos|Fadilah Abidana, S.S.,M.Pd|Bayu Nirpana, S.H., M.H|Hamzah Robani, S.Sos, L.c, M.Kom|Fadilah Abidana, S.S.,M.Pd|M. Irham Al Baihaqi|Isnan Aprizal Hafizh|Ahmad Lujaenilma, S.Kom|Isnan Aprizal Hafizh|Ahmad Hasan Munjaji",
    "7|Fadilah Abidana, S.S.,M.Pd|Bayu Nirpana, S.H., M.H|M. Hanif Fauzi, M.Pd|Fadilah Abidana, S.S.,M.Pd|Ahmad Lujaenilma, S.Kom|Hamzah Robani, S.Sos, L.c, M.Kom|Fadilah Abidana, S.S.,M.Pd|Khairil Fahmi, S.Pd|Isnan Aprizal Hafizh|Muhammad Suhail, S.Pd.I|Isnan Aprizal Hafizh",
    "8|Khairil Fahmi, S.Pd|Fadilah Abidana, S.S.,M.Pd|Doni Subiyanto, S.E|M. Hanif Fauzi, M.Pd|Muhammad Akbar Al-Ghifari|Ahmad Lujaenilma, S.Kom|Hamzah Robani, S.Sos, L.c, M.Kom|Sadam Hamzah, S.Hi|Almaas Jhoung Asri|Rifqi Rahmatuloh|Muhammad Suhail, S.Pd.I",
    "9|M. Hanif Fauzi, M.Pd|Khairil Fahmi, S.Pd|Fadhilah, S.Pd|Doni Subiyanto, S.E|M. Irham Al Baihaqi|Muhammad Akbar Al-Ghifari|Ahmad Lujaenilma, S.Kom|M. Hidayatu Rusydi, S.H|Sadam Hamzah, S.Hi|Khairil Fahmi, S.Pd|Rifqi Rahmatuloh",
    "10|Ichsanul Afief, S.Sos|M. Hanif Fauzi, M.Pd|Bayu Nirpana, S.H., M.H|Fadhilah, S.Pd|Fadilah Abidana, S.S.,M.Pd|M. Irham Al Baihaqi|Muhammad Akbar Al-Ghifari|Ahmad Lujaenilma, S.Kom|M. Hidayatu Rusydi, S.H|Ahmad Hasan Munjaji|Khairil Fahmi, S.Pd"
  ],
  SMP: [
    "11|Nur Azizah, S.Pd|Alfi Nurfadilah|Salwa Binta Tsania|Subhan, S.Pd|Syafon Oktavia Rahma|Siti Nurzulfiah, S.Pd.I|Siti Halimah, S.Si., S.Pd|Siti Fatimah Zahra|Nazwa Yunita|Siti Fatimah Zahra",
    "12|Subhan, S.Pd|Nur Azizah, S.Pd|Fiqih Kartika Murni, S.Pd|Salwa Binta Tsania|Anisa Siti Nabilah, S.Pd|Syafon Oktavia Rahma|Siti Nurzulfiah, S.Pd.I|Aulia Sabila Mufida|Aini Syifa, S.S|Nazwa Yunita",
    "13|Fiqih Kartika Murni, S.Pd|Subhan, S.Pd|Nur Azizah, S.Pd|Fiqih Kartika Murni, S.Pd|Dea Amanda Putri|Anisa Siti Nabilah, S.Pd|Syafon Oktavia Rahma|Ilmi Miftahul Jannah|Aulia Sabila Mufida|Aini Syifa, S.S",
    "14|Siti Fatimah Zahra|Fiqih Kartika Murni, S.Pd|Aini Syifa, S.S|Nur Azizah, S.Pd|Ilmi Miftahul Jannah|Dea Amanda Putri|Anisa Siti Nabilah, S.Pd|Siska Yunita Dewi|Silmi Sabila|Aulia Sabila Mufida",
    "15|Syafon Oktavia Rahma|Siti Fatimah Zahra|Rahmati Kurrata'Aini, .S|Aini Syifa, S.S|Ahmad Sukanta, S.Pd|Ilmi Miftahul Jannah|Dea Amanda Putri|Nazwa Yunita|Siti Halimah, S.Si., S.Pd|Silmi Sabila",
    "16|Rahmati Kurrata'Aini, .S|Syafon Oktavia Rahma|Siska Indriyani, S.Sos|Rahmati Kurrata'Aini, .S|Siska Yunita Dewi|Ahmad Sukanta, S.Pd|Ilmi Miftahul Jannah|Alfi Nurfadilah|Siti Nurzulfiah, S.Pd.I|Siti Halimah, S.Si., S.Pd",
    "17|Siska Indriyani, S.Sos|Rahmati Kurrata'Aini, .S|Alfi Nurfadilah|Siska Indriyani, S.Sos|Siti Halimah, S.Si., S.Pd|Siska Yunita Dewi|Ahmad Sukanta, S.Pd|Ahdini Rahmatillah Lc. S.S|Dea Amanda Putri|Siti Nurzulfiah, S.Pd.I",
    "18|Alfi Nurfadilah|Siska Indriyani, S.Sos|Subhan, S.Pd|Alfi Nurfadilah|Siti Nurzulfiah, S.Pd.I|Siti Halimah, S.Si., S.Pd|Siska Yunita Dewi|Syafon Oktavia Rahma|Siti Fatimah Zahra|Dea Amanda Putri",
    "19|Muhammad Ihsan|Muhamad Mashur|Almaas Jhoung Asti|Moh Afriza Tri Wardana|Almaas Jhoung Asti|M. Alief Nugraha, S.H|Hammad Iyyad Faiji|Muhammad Ihsan|Muhammad Fikri Al-Anshory|Ahmad Sukanta, S.Pd",
    "20|Fathurachman, S.Pd|Muhammad Ihsan|Abdul Hariz Naufal S.Ag|Almaas Jhoung Asti|Noor Faiz, S.Pd|Almaas Jhoung Asti|M. Alief Nugraha, S.H|Muhammad Zaki|Nurizal Muzaki|Muhammad Fikri Al-Anshory",
    "21|Ahmad Hasan Munjaji|Fathurachman, S.Pd|Fathurachman, S.Pd|Abdul Hariz Naufal S.Ag|Subhan, S.Pd|Noor Faiz, S.Pd|Almaas Jhoung Asti|Abdul Fattah Azzam|Muhamad Mashur|Nurizal Muzaki",
    "22|Muhamad Mashur|Ahmad Hasan Munjaji|Ade Ihsan Firdaus|Fathurachman, S.Pd|Abdul Hariz Naufal S.Ag|Subhan, S.Pd|Noor Faiz, S.Pd|Noor Faiz, S.Pd|Muhammad Zaki|Muhamad Mashur",
    "23|Fahru Roji Malik S.M|Muhamad Mashur|Toni, S.Pd|Ade Ihsan Firdaus|Muhamad Mashur|Abdul Hariz Naufal S.Ag|Subhan, S.Pd|Ade Ihsan Firdaus|Ade Ihsan Firdaus|Muhammad Zaki",
    "24|Toni, S.Pd|Fahru Roji Malik S.M|Hammad Iyyad Faiji|Toni, S.Pd|Muhammad Zaki|Muhamad Mashur|Abdul Hariz Naufal S.Ag|Muhammad Fikri Al-Anshory|Hammad Iyyad Faiji|Ade Ihsan Firdaus",
    "25|M. Alief Nugraha, S.H|Toni, S.Pd|Abdul Fattah Azzam|Hammad Iyyad Faiji|Hammad Iyyad Faiji|Muhammad Zaki|Muhamad Mashur|Fathurachman, S.Pd|M. Jaelani Basri, S.Pd|Hammad Iyyad Faiji",
    "26|Muhamad Mashur|M. Alief Nugraha, S.H|Moh Afriza Tri Wardana|Abdul Fattah Azzam|M. Alief Nugraha, S.H|Hammad Iyyad Faiji|Muhammad Zaki|Abdul Fattah Azzam|Ahmad Sukanta, S.Pd|M. Jaelani Basri, S.Pd"
  ]
};

export function normalize(s: string | null | undefined): string {
  return String(s || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');
}

export function parseSlots(unit: string): [string, string, string][] {
  const u = String(unit || '').trim().toUpperCase();
  if (u === 'SMA') {
    return [
      ['21/09/2026', 'SENIN', 'I'],
      ['21/09/2026', 'SENIN', 'II'],
      ['22/09/2026', 'SELASA', 'I'],
      ['22/09/2026', 'SELASA', 'II'],
      ['23/09/2026', 'RABU', 'I'],
      ['23/09/2026', 'RABU', 'II'],
      ['23/09/2026', 'RABU', 'III'],
      ['24/09/2026', 'KAMIS', 'I'],
      ['24/09/2026', 'KAMIS', 'II'],
      ['25/09/2026', 'JUMAT', 'I'],
      ['25/09/2026', 'JUMAT', 'II']
    ];
  } else {
    // SMP: Pada hari Kamis sesi Jam II dikosongkan (shaded black), sehingga 10 slot berurutan adalah:
    // Senin I, Senin II, Selasa I, Selasa II, Rabu I, Rabu II, Rabu III, Kamis I, Jumat I, Jumat II
    return [
      ['21/09/2026', 'SENIN', 'I'],
      ['21/09/2026', 'SENIN', 'II'],
      ['22/09/2026', 'SELASA', 'I'],
      ['22/09/2026', 'SELASA', 'II'],
      ['23/09/2026', 'RABU', 'I'],
      ['23/09/2026', 'RABU', 'II'],
      ['23/09/2026', 'RABU', 'III'],
      ['24/09/2026', 'KAMIS', 'I'],
      ['25/09/2026', 'JUMAT', 'I'],
      ['25/09/2026', 'JUMAT', 'II']
    ];
  }
}

export function scheduleRows(unit: string): JadwalItem[] {
  const u = (String(unit || '').trim().toUpperCase() || 'SMA') as UnitSekolah;
  const rawList = RAW_SCHEDULE_DATA[u] || [];
  const slots = parseSlots(u);
  const out: JadwalItem[] = [];

  rawList.forEach((line) => {
    const parts = line.split('|');
    const ruang = (parts.shift() || '').trim();
    parts.forEach((nama, i) => {
      const trimmedNama = String(nama || '').trim();
      if (slots[i] && trimmedNama) {
        out.push({
          UNIT: u,
          TANGGAL: slots[i][0],
          HARI: slots[i][1],
          JAM_KE: slots[i][2],
          RUANG: ruang,
          NAMA_PENGAWAS: trimmedNama,
        });
      }
    });
  });

  return out;
}

export function getScheduleForPengawas(unit: string, nama: string): JadwalItem[] {
  const all = scheduleRows(unit);
  const normNama = normalize(nama);
  return all.filter((r) => normalize(r.NAMA_PENGAWAS) === normNama);
}

export interface ScheduleMatrixColumn {
  date: string;
  day: string;
  jam: string;
  isBlackout?: boolean;
}

export interface ScheduleMatrixRow {
  ruang: string;
  pengawas: (string | null)[];
}

export function getScheduleMatrix(unit: UnitSekolah): {
  columns: ScheduleMatrixColumn[];
  rows: ScheduleMatrixRow[];
} {
  if (unit === 'SMA') {
    const columns: ScheduleMatrixColumn[] = [
      { date: '21 September 2026', day: 'SENIN', jam: 'I' },
      { date: '21 September 2026', day: 'SENIN', jam: 'II' },
      { date: '22 September 2026', day: 'SELASA', jam: 'I' },
      { date: '22 September 2026', day: 'SELASA', jam: 'II' },
      { date: '23 September 2026', day: 'RABU', jam: 'I' },
      { date: '23 September 2026', day: 'RABU', jam: 'II' },
      { date: '23 September 2026', day: 'RABU', jam: 'III' },
      { date: '24 September 2026', day: 'KAMIS', jam: 'I' },
      { date: '24 September 2026', day: 'KAMIS', jam: 'II' },
      { date: '25 September 2026', day: "JUM'AT", jam: 'I' },
      { date: '25 September 2026', day: "JUM'AT", jam: 'II' },
    ];

    const rows: ScheduleMatrixRow[] = RAW_SCHEDULE_DATA.SMA.map((line) => {
      const parts = line.split('|');
      const ruang = parts[0];
      const pengawas = parts.slice(1);
      return { ruang, pengawas };
    });

    return { columns, rows };
  } else {
    const columns: ScheduleMatrixColumn[] = [
      { date: '21 September 2026', day: 'SENIN', jam: 'I' },
      { date: '21 September 2026', day: 'SENIN', jam: 'II' },
      { date: '22 September 2026', day: 'SELASA', jam: 'I' },
      { date: '22 September 2026', day: 'SELASA', jam: 'II' },
      { date: '23 September 2026', day: 'RABU', jam: 'I' },
      { date: '23 September 2026', day: 'RABU', jam: 'II' },
      { date: '23 September 2026', day: 'RABU', jam: 'III' },
      { date: '24 September 2026', day: 'KAMIS', jam: 'I' },
      { date: '24 September 2026', day: 'KAMIS', jam: 'II', isBlackout: true },
      { date: '25 September 2026', day: "JUM'AT", jam: 'I' },
      { date: '25 September 2026', day: "JUM'AT", jam: 'II' },
    ];

    const rows: ScheduleMatrixRow[] = RAW_SCHEDULE_DATA.SMP.map((line) => {
      const parts = line.split('|');
      const ruang = parts[0];
      const rawNames = parts.slice(1);
      // Map 10 raw names into the 11 columns (with Kamis II being null/blackout)
      const pengawas: (string | null)[] = [
        rawNames[0], // Senin I
        rawNames[1], // Senin II
        rawNames[2], // Selasa I
        rawNames[3], // Selasa II
        rawNames[4], // Rabu I
        rawNames[5], // Rabu II
        rawNames[6], // Rabu III
        rawNames[7], // Kamis I
        null,        // Kamis II (Kosong/Blackout)
        rawNames[8], // Jumat I
        rawNames[9], // Jumat II
      ];
      return { ruang, pengawas };
    });

    return { columns, rows };
  }
}
