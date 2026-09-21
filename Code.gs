const CONFIG = {
  APP_VERSION: '2.3.0',
  API_KEY: 'AL-GHOZALI-PRESENSI-2026',
  TIMEZONE: 'Asia/Jakarta',

  // MASTER TIDAK dibuat dari CSV.
  // Sumber nama pengawas adalah spreadsheet resmi yang sudah ada.
  DATABASE: {
    SMA: {
      ID: '1C6C1pXqQFMc7EeML9sDTC1w32w6RfsP0upFwKgasr68',
      NAME: 'DAFTAR HADIR PENGAWAS ASTS GANJIL SMA'
    },
    SMP: {
      ID: '1WXd-WfnlFKegeHzyM6Uvqgu9Xmpsrv2vEebF8I9bhEM',
      NAME: 'DAFTAR HADIR PENGAWAS ASTS GANJIL SMP'
    }
  },

  SHEETS: {
    AUTH: 'AUTH_PENGAWAS',
    JADWAL: 'JADWAL_PENGAWAS',
    PRESENSI: 'PRESENSI_PENGAWAS',
    REKAP: 'REKAP_PENGAWAS'
  }
};

const STATUS = ['HADIR','IZIN','SAKIT','ALPA','DIGANTIKAN'];

function doPost(e) {
  try {
    const p = parseRequest_(e);
    if (p.api_key !== CONFIG.API_KEY) {
      return json_({ok:false, message:'API key tidak valid.'});
    }

    switch (String(p.action || '').toLowerCase()) {
      case 'cek_akses_hari_ini': return json_(cekAksesHariIni_(p));
      case 'get_pengawas': return json_(getPengawas_(p));
      case 'register_pin': return json_(registerPin_(p));
      case 'login': return json_(login_(p));
      case 'get_jadwal_pengawas': return json_(getJadwal_(p));
      case 'checkin': return json_(checkin_(p));
      case 'get_rekap': return json_(getRekap_(p));
      case 'diagnose': return json_(diagnose_(p));
      case 'setup': return json_(setup_(p));
      default: return json_({ok:false, message:'Action tidak dikenal: ' + p.action});
    }
  } catch (err) {
    return json_({ok:false, message:err.message || String(err)});
  }
}

function doGet() {
  return json_({
    ok:true,
    app:'Presensi Pengawas Al-Ghozali',
    version:CONFIG.APP_VERSION,
    status:'online',
    master_source:'Master pengawas tertanam di aplikasi Python; Google Sheets untuk data transaksi'
  });
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try { return JSON.parse(e.postData.contents); }
  catch (_) { return e.parameter || {}; }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function db_(unit) {
  const u = String(unit || '').trim().toUpperCase();
  if (!CONFIG.DATABASE[u]) throw new Error('Jenjang tidak tersedia: ' + u);
  return SpreadsheetApp.openById(CONFIG.DATABASE[u].ID);
}

function normalize_(s) {
  return String(s == null ? '' : s)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');
}

function headerMap_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (!lastRow || !lastCol) return {};
  // MASTER resmi biasanya header di baris 1. Untuk spreadsheet yang
  // memiliki judul di atas tabel, cek sampai 5 baris pertama.
  const scanRows = Math.min(lastRow, 5);
  const grid = sheet.getRange(1,1,scanRows,lastCol).getDisplayValues();
  const aliases = [
    'NAMA PENGAWAS','NAMA_PENGAWAS','NAMA PENGAWAS UJIAN',
    'NAMA GURU','NAMA_GURU','NAMA GURU/PENGAWAS'
  ];
  for (let r=0; r<grid.length; r++) {
    const map = {};
    grid[r].forEach((v,i) => {
      const n = normalize_(v);
      if (n) map[n] = i;
    });
    if (findColumn_(map, aliases) >= 0) {
      map.__HEADER_ROW__ = r + 1;
      return map;
    }
  }
  return {};
}

function findColumn_(map, aliases) {
  for (const alias of aliases) {
    const key = normalize_(alias);
    if (map[key] !== undefined) return map[key];
  }
  return -1;
}

/**
 * Mencari MASTER RESMI yang sudah ada.
 *
 * Penting:
 * - Tidak membaca CSV.
 * - Tidak membuat master.
 * - Tidak menyalin nama guru/pengawas.
 * - Tidak memakai header generik "NAMA" karena berisiko salah memilih sheet.
 *
 * Prioritas:
 * 1. Nama tab yang jelas sebagai master.
 * 2. Header NAMA PENGAWAS / NAMA GURU.
 */
function findMasterSheet_(ss) {
  const preferredNames = [
    'MASTER PENGAWAS',
    'MASTER GURU',
    'MASTER GURU PENGAWAS',
    'MASTER GURU/PENGAWAS',
    'MASTER_PENGAWAS',
    'MASTER_GURU',
    'MASTER'
  ];

  let candidates = [];

  ss.getSheets().forEach(sh => {
    const sheetName = normalize_(sh.getName());

    // Sheet transaksi milik aplikasi bukan master.
    if ([
      normalize_(CONFIG.SHEETS.AUTH),
      normalize_(CONFIG.SHEETS.JADWAL),
      normalize_(CONFIG.SHEETS.PRESENSI),
      normalize_(CONFIG.SHEETS.REKAP)
    ].indexOf(sheetName) >= 0) return;

    const map = headerMap_(sh);
    const nameCol = findColumn_(map, [
      'NAMA PENGAWAS',
      'NAMA_PENGAWAS',
      'NAMA PENGAWAS UJIAN',
      'NAMA GURU',
      'NAMA_GURU',
      'NAMA GURU/PENGAWAS'
    ]);

    if (nameCol < 0) return;

    let score = 0;
    if (preferredNames.indexOf(sheetName) >= 0) score += 100;

    if (findColumn_(map, ['UNIT','JENJANG','UNIT SEKOLAH','JENJANG SEKOLAH']) >= 0) score += 20;
    if (findColumn_(map, ['STATUS','AKTIF']) >= 0) score += 10;
    if (findColumn_(map, ['MAPEL','MATA PELAJARAN']) >= 0) score += 5;

    candidates.push({
      sheet: sh,
      map: map,
      nameCol: nameCol,
      score: score
    });
  });

  if (!candidates.length) return null;

  candidates.sort((a,b) => b.score - a.score);
  return candidates[0];
}

function getPengawas_(p) {
  const unit = String(p.unit || '').trim().toUpperCase();
  const ss = db_(unit);
  const master = findMasterSheet_(ss);

  if (!master) {
    return {
      ok:false,
      message:
        'MASTER PENGAWAS/GURU tidak ditemukan pada spreadsheet resmi ' +
        CONFIG.DATABASE[unit].NAME +
        '. Sistem TIDAK menggunakan CSV dan TIDAK membuat master baru.'
    };
  }

  const values = master.sheet.getDataRange().getDisplayValues();
  const headerRow = Number(master.map.__HEADER_ROW__ || 1);
  const unitCol = findColumn_(master.map, [
    'UNIT','JENJANG','UNIT SEKOLAH','JENJANG SEKOLAH'
  ]);
  const activeCol = findColumn_(master.map, ['AKTIF','STATUS']);

  const out = [];

  for (let r=headerRow; r<values.length; r++) {
    const name = String(values[r][master.nameCol] || '').trim();
    if (!name) continue;

    if (
      unitCol >= 0 &&
      String(values[r][unitCol]).trim() &&
      normalize_(values[r][unitCol]) !== normalize_(unit)
    ) continue;

    if (activeCol >= 0) {
      const active = normalize_(values[r][activeCol]);
      if (['TIDAK','NONAKTIF','INACTIVE','0','FALSE'].indexOf(active) >= 0) continue;
    }

    if (out.indexOf(name) < 0) out.push(name);
  }

  out.sort((a,b) => a.localeCompare(b,'id'));

  return {
    ok:true,
    data:out,
    count:out.length,
    source:{
      spreadsheet_id:CONFIG.DATABASE[unit].ID,
      spreadsheet_name:CONFIG.DATABASE[unit].NAME,
      sheet_name:master.sheet.getName(),
      source_type:'GOOGLE_SHEETS_MASTER',
      header_row:headerRow
    }
  };
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  }

  return sh;
}

function ensureCoreSheets_(ss) {
  // Hanya membuat SHEET TRANSAKSI aplikasi.
  // Tidak pernah membuat atau menyalin MASTER.
  ensureSheet_(ss, CONFIG.SHEETS.AUTH,
    ['NAMA_PENGAWAS','PIN_HASH','AKTIF','UPDATED_AT']);

  ensureSheet_(ss, CONFIG.SHEETS.JADWAL,
    ['UNIT','TANGGAL','HARI','JAM_KE','RUANG','NAMA_PENGAWAS']);

  ensureSheet_(ss, CONFIG.SHEETS.PRESENSI,
    ['HARI/TANGGAL','NAMA PENGAWAS','PENGAWAS PENGGANTI',
     'RUANG','JAM KE','JUMLAH MENGAWAS','KETERANGAN','WAKTU INPUT']);

  ensureSheet_(ss, CONFIG.SHEETS.REKAP,
    ['NAMA PENGAWAS','UNIT','JUMLAH MENGAWAS',
     'HADIR','IZIN','SAKIT','ALPA','DIGANTIKAN']);
}

function sha256_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text),
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}

function scheduleRows_(unit) {
  const u = String(unit || '').trim().toUpperCase();
  const data = SCHEDULE_DATA[u] || [];
  const slots = u === 'SMA' ? [
    ['21/09/2026','SENIN','I'],['21/09/2026','SENIN','II'],
    ['22/09/2026','SELASA','I'],['22/09/2026','SELASA','II'],
    ['23/09/2026','RABU','I'],['23/09/2026','RABU','II'],['23/09/2026','RABU','III'],
    ['24/09/2026','KAMIS','I'],['24/09/2026','KAMIS','II'],
    ['25/09/2026','JUMAT','I'],['25/09/2026','JUMAT','II']
  ] : [
    ['21/09/2026','SENIN','I'],['21/09/2026','SENIN','II'],
    ['22/09/2026','SELASA','I'],['22/09/2026','SELASA','II'],
    ['23/09/2026','RABU','I'],['23/09/2026','RABU','II'],['23/09/2026','RABU','III'],
    ['24/09/2026','KAMIS','I'],['24/09/2026','KAMIS','II'],
    ['25/09/2026','JUMAT','I']
  ];
  const out = [];
  data.forEach(line => {
    const a = String(line).split('|');
    const ruang = String(a.shift() || '').trim();
    a.forEach((nama, i) => {
      if (slots[i] && String(nama).trim()) {
        out.push({
          UNIT:u,
          TANGGAL:slots[i][0],
          HARI:slots[i][1],
          JAM_KE:slots[i][2],
          RUANG:ruang,
          NAMA_PENGAWAS:String(nama).trim()
        });
      }
    });
  });
  return out;
}

function cekAksesHariIni_(p) {
  const unit = String(p.unit || '').trim().toUpperCase();
  const nama = String(p.nama || '').trim();

  if (!unit || !nama) {
    return {ok:false, message:'Jenjang dan nama pengawas wajib dipilih.'};
  }

  const tanggalHariIni = Utilities.formatDate(
    new Date(),
    CONFIG.TIMEZONE,
    'dd/MM/yyyy'
  );

  const rows = scheduleRows_(unit).filter(r =>
    r.TANGGAL === tanggalHariIni &&
    normalize_(r.NAMA_PENGAWAS) === normalize_(nama)
  );

  if (!rows.length) {
    return {
      ok:false,
      tanggal:tanggalHariIni,
      message:'Akses ditolak. Nama ini tidak memiliki jadwal pengawasan pada hari ini.'
    };
  }

  return {
    ok:true,
    tanggal:tanggalHariIni,
    data:rows.map(r => ({
      tanggal:r.TANGGAL,
      hari:r.HARI,
      jam_ke:r.JAM_KE,
      ruang:r.RUANG
    })),
    message:'Akses diberikan berdasarkan jadwal resmi aplikasi hari ini.'
  };
}


function registerPin_(p) {
  const unit = String(p.unit || '').toUpperCase();
  const nama = String(p.nama || '').trim();
  const pin = String(p.pin || '');

  if (!/^\d{6,}$/.test(pin)) {
    return {ok:false,message:'PIN minimal 6 digit dan hanya angka.'};
  }

  // Master nama sudah ditanam di app.py.
  // Apps Script tidak lagi memvalidasi nama terhadap sheet MASTER.
  // AUTH_PENGAWAS menjadi penyimpanan PIN saja.
  if (!nama) {
    return {ok:false,message:'Nama pengawas wajib dipilih.'};
  }

  const ss = db_(unit);
  ensureCoreSheets_(ss);

  const sh = ss.getSheetByName(CONFIG.SHEETS.AUTH);
  const values = sh.getDataRange().getDisplayValues();

  for (let r=1; r<values.length; r++) {
    if (normalize_(values[r][0]) === normalize_(nama)) {
      sh.getRange(r+1,2,1,3).setValues([
        [sha256_(pin), true, new Date()]
      ]);
      return {ok:true,message:'PIN berhasil diperbarui.'};
    }
  }

  sh.appendRow([nama, sha256_(pin), true, new Date()]);
  return {ok:true,message:'PIN berhasil didaftarkan.'};
}

function login_(p) {
  const unit = String(p.unit || '').toUpperCase();
  const nama = String(p.nama || '').trim();
  const pin = String(p.pin || '');

  if (!/^\d{6,}$/.test(pin)) {
    return {ok:false,message:'PIN minimal 6 digit.'};
  }

  const ss = db_(unit);
  ensureCoreSheets_(ss);

  const sh = ss.getSheetByName(CONFIG.SHEETS.AUTH);
  const values = sh.getDataRange().getDisplayValues();

  for (let r=1; r<values.length; r++) {
    if (normalize_(values[r][0]) === normalize_(nama)) {
      if (['FALSE','TIDAK'].indexOf(normalize_(values[r][2])) >= 0) {
        return {ok:false,message:'Akun tidak aktif.'};
      }

      if (values[r][1] !== sha256_(pin)) {
        return {ok:false,message:'PIN salah.'};
      }

      return {ok:true,message:'Login berhasil.'};
    }
  }

  return {
    ok:false,
    message:'PIN belum terdaftar. Gunakan Pendaftaran PIN terlebih dahulu.'
  };
}

function seedSchedule_(unit) {
  const u=String(unit||'').toUpperCase();
  const data=SCHEDULE_DATA[u]||[];
  const ss=db_(u);
  const sh=ensureSheet_(ss,CONFIG.SHEETS.JADWAL,['UNIT','TANGGAL','HARI','JAM_KE','RUANG','NAMA_PENGAWAS']);
  if(sh.getLastRow()>1) return {inserted:0,existing:sh.getLastRow()-1};
  const slots=u==='SMA' ? [
    ['21/09/2026','SENIN','I'],['21/09/2026','SENIN','II'],
    ['22/09/2026','SELASA','I'],['22/09/2026','SELASA','II'],
    ['23/09/2026','RABU','I'],['23/09/2026','RABU','II'],['23/09/2026','RABU','III'],
    ['24/09/2026','KAMIS','I'],['24/09/2026','KAMIS','II'],
    ['25/09/2026','JUMAT','I'],['25/09/2026','JUMAT','II']
  ] : [
    ['21/09/2026','SENIN','I'],['21/09/2026','SENIN','II'],
    ['22/09/2026','SELASA','I'],['22/09/2026','SELASA','II'],
    ['23/09/2026','RABU','I'],['23/09/2026','RABU','II'],['23/09/2026','RABU','III'],
    ['24/09/2026','KAMIS','I'],['24/09/2026','KAMIS','II'],
    ['25/09/2026','JUMAT','I']
  ];
  const out=[];
  data.forEach(line=>{
    const a=line.split('|');
    const room=a.shift();
    a.forEach((name,i)=>{ if(slots[i] && name.trim()) out.push([u,slots[i][0],slots[i][1],slots[i][2],room,name.trim()]); });
  });
  if(out.length) sh.getRange(sh.getLastRow()+1,1,out.length,6).setValues(out);
  return {inserted:out.length,existing:0};
}

function getJadwal_(p) {
  const unit = String(p.unit || '').toUpperCase();
  const nama = String(p.nama || '').trim();
  const out = scheduleRows_(unit).filter(r =>
    normalize_(r.NAMA_PENGAWAS) === normalize_(nama)
  );
  return {ok:true,data:out};
}
function checkin_(p) {
  const unit = String(p.unit || '').toUpperCase();
  const nama = String(p.nama || '').trim();
  const tanggal = String(p.tanggal || '').trim();
  const hari = String(p.hari || '').trim();
  const jam = String(p.jam_ke || '').trim();
  const ruang = String(p.ruang || '').trim();
  const status = String(p.status || '').toUpperCase();
  const pengganti = String(p.pengganti || '').trim();

  if (STATUS.indexOf(status) < 0) {
    return {ok:false,message:'Status presensi tidak valid.'};
  }
  if (status === 'DIGANTIKAN' && !pengganti) {
    return {ok:false,message:'Pengawas pengganti wajib diisi.'};
  }

  const jad = scheduleRows_(unit);
  const scheduledRows = jad.filter(r =>
    r.TANGGAL === tanggal &&
    normalize_(r.HARI) === normalize_(hari) &&
    normalize_(r.JAM_KE) === normalize_(jam) &&
    normalize_(r.RUANG) === normalize_(ruang) &&
    normalize_(r.NAMA_PENGAWAS) === normalize_(nama)
  );

  if (!scheduledRows.length) {
    return {
      ok:false,
      message:'Validasi gagal: pengawas tidak terjadwal pada tanggal/ruang/jam tersebut.'
    };
  }

  const ss = db_(unit);
  ensureCoreSheets_(ss);
  const sh = ss.getSheetByName(CONFIG.SHEETS.PRESENSI);
  const values = sh.getDataRange().getDisplayValues();

  let found = -1;
  for (let r=1; r<values.length; r++) {
    if (
      String(values[r][0]) === tanggal + ' ' + hari &&
      normalize_(values[r][1]) === normalize_(nama) &&
      normalize_(values[r][3]) === normalize_(ruang) &&
      normalize_(values[r][4]) === normalize_(jam)
    ) {
      found = r + 1;
      break;
    }
  }

  const jumlah = jad.filter(r =>
    normalize_(r.NAMA_PENGAWAS) === normalize_(nama)
  ).length;

  const now = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
  const row = [tanggal + ' ' + hari, nama, pengganti, ruang, jam, jumlah, status, now];

  if (found > 0) {
    sh.getRange(found,1,1,row.length).setValues([row]);
  } else {
    sh.appendRow(row);
  }

  updateRekap_(unit, nama);
  return {ok:true,message:'Presensi tersimpan.',waktu_input:now};
}
function updateRekap_(unit,nama) {
  const ss = db_(unit);
  ensureCoreSheets_(ss);

  const p = ss.getSheetByName(CONFIG.SHEETS.PRESENSI)
    .getDataRange().getDisplayValues();

  const j = ss.getSheetByName(CONFIG.SHEETS.JADWAL)
    .getDataRange().getDisplayValues();

  const assigned = j.slice(1).filter(r =>
    normalize_(r[0]) === normalize_(unit) &&
    normalize_(r[5]) === normalize_(nama)
  ).length;

  const counts = {
    HADIR:0, IZIN:0, SAKIT:0, ALPA:0, DIGANTIKAN:0
  };

  p.slice(1).forEach(r => {
    const s = normalize_(r[6]);
    if (counts[s] !== undefined) counts[s]++;
  });

  const sh = ss.getSheetByName(CONFIG.SHEETS.REKAP);
  const v = sh.getDataRange().getDisplayValues();

  const row = [
    nama, unit, assigned,
    counts.HADIR,
    counts.IZIN,
    counts.SAKIT,
    counts.ALPA,
    counts.DIGANTIKAN
  ];

  for (let r=1; r<v.length; r++) {
    if (
      normalize_(v[r][0]) === normalize_(nama) &&
      normalize_(v[r][1]) === normalize_(unit)
    ) {
      sh.getRange(r+1,1,1,row.length).setValues([row]);
      return;
    }
  }

  sh.appendRow(row);
}

function getRekap_(p) {
  const unit = String(p.unit || '').toUpperCase();
  const nama = String(p.nama || '').trim();

  const ss = db_(unit);
  ensureCoreSheets_(ss);
  updateRekap_(unit,nama);

  const v = ss.getSheetByName(CONFIG.SHEETS.REKAP)
    .getDataRange().getDisplayValues();

  const out = [];

  for (let r=1; r<v.length; r++) {
    if (normalize_(v[r][0]) === normalize_(nama)) {
      out.push({
        'NAMA PENGAWAS':v[r][0],
        'UNIT':v[r][1],
        'JUMLAH MENGAWAS':v[r][2],
        'HADIR':v[r][3],
        'IZIN':v[r][4],
        'SAKIT':v[r][5],
        'ALPA':v[r][6],
        'DIGANTIKAN':v[r][7]
      });
    }
  }

  return {ok:true,data:out};
}

function diagnose_(p) {
  const result = [];

  Object.keys(CONFIG.DATABASE).forEach(unit => {
    const ss = db_(unit);
    const master = findMasterSheet_(ss);

    result.push({
      unit:unit,
      spreadsheet_id:CONFIG.DATABASE[unit].ID,
      spreadsheet_name:CONFIG.DATABASE[unit].NAME,
      sheets:ss.getSheets().map(s => s.getName()),
      master_found:!!master,
      master_sheet:master ? master.sheet.getName() : null,
      master_name_column:master ? master.nameCol + 1 : null,
      source_type:'GOOGLE_SHEETS_MASTER',
      csv_used:false
    });
  });

  return {ok:true,app_version:CONFIG.APP_VERSION,data:result};
}

function setup_(p) {
  const result = [];

  Object.keys(CONFIG.DATABASE).forEach(unit => {
    const ss = db_(unit);
    ensureCoreSheets_(ss);
    const master = findMasterSheet_(ss);

    result.push({
      unit:unit,
      spreadsheet_id:CONFIG.DATABASE[unit].ID,
      master:master ? master.sheet.getName() : null
    });
  });

  return {
    ok:true,
    message:'Database siap. Master resmi tetap di spreadsheet; CSV tidak digunakan.',
    data:result
  };
}