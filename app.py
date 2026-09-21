import os
from datetime import datetime
from zoneinfo import ZoneInfo
import requests
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Presensi Pengawas Al-Ghozali v2", page_icon="📝", layout="wide")
APP_VERSION = "2.3.0"

API_URL_DEFAULT = "https://script.google.com/macros/s/AKfycbwh5x9j_OaZDF5L5oO_dAcq2UdVmRpPjaL6-DsHqhs48OIN2aX39TEhMVvQwQQ1d52z/exec"
API_KEY_DEFAULT = "AL-GHOZALI-PRESENSI-2026"

# MASTER PENGAWAS DITANAM LANGSUNG DI APLIKASI.
# Tidak mengambil daftar nama dari CSV atau Google Spreadsheet.
MASTER_PENGAWAS = [
    "Barirotul Choiriyah, S.E",
    "Ir. Rachmawati, M.Pd",
    "Ahdini Rahmatillah Lc. S.S",
    "Verary Pratama Putri S.E",
    "Nurlaila, SM M.Pd",
    "Sadam Hamzah, S.Hi",
    "Venty Rahmawati, M.Pd",
    "Aini Syifa, S.S",
    "Lulu Zahrotunnisa, S.Pd",
    "M. Hidayatu Rusydi, S.H",
    "Nailul Kunni Fureida, S.Gz",
    "Muhammad Suhail, S.Pd.l",
    "Muhammad Farid, S.Pd.l",
    "Rizki Karomah, S.Si",
    "Fadhilah, S.Pd",
    "Bayu Nirpana, S.H., M.H",
    "Ichsanul Afief, S.Sos",
    "Fadilah Abidana, S.S.,M.Pd",
    "Hamzah Robani, S.Sos, L.c, M.Kom",
    "M. Irham Al Baihaqi",
    "Isnan Aprizal Hafizh",
    "Ahmad Lujaenilma, S.Kom",
    "Ahmad Hasan Munjaji",
    "M. Hanif Fauzi, M.Pd",
    "Khairil Fahmi, S.Pd",
    "Doni Subiyanto, S.E",
    "Muhammad Akbar Al-Ghifari",
    "Almaas Jhoung Asri",
    "Rifqi Rahmatuloh",
    "Nur Azizah, S.Pd",
    "Alfi Nurfadilah",
    "Salwa Binta Tsania",
    "Subhan, S.Pd",
    "Syafon Oktavia Rahma",
    "Siti Nurzulfiah, S.Pd.I",
    "Siti Halimah, S.Si., S.Pd",
    "Siti Fatimah Zahra",
    "Nazwa Yunita",
    "Fiqih Kartika Murni, S.Pd",
    "Anisa Siti Nabilah, S.Pd",
    "Aulia Sabila Mufida",
    "Dea Amanda Putri",
    "Ilmi Miftahul Jannah",
    "Siska Yunita Dewi",
    "Silmi Sabila",
    "Rahmati Kurrata'Aini, .S",
    "Ahmad Sukanta, S.Pd",
    "Siska Indriyani, S.Sos",
    "Muhammad Ihsan",
    "Muhamad Mashur",
    "Moh Afriza Tri Wardana",
    "M. Alief Nugraha, S.H",
    "Hammad lyyad Faiji",
    "Muhammad Fikri Al- Anshory",
    "Fathurachman, S.Pd",
    "Abdul Hariz Naufal S.Ag",
    "Noor Faiz, S.Pd",
    "Muhammad Zaki",
    "Nurizal Muzaki",
    "Abdul Fattah Azzam",
    "Ade Ihsan Firdaus",
    "Fahru Roji Malik S.M",
    "Toni, S.Pd",
    "M. Jaelani Basri, S.Pd",
]

def cfg(key, default=""):
    try:
        value = st.secrets.get(key, "")
    except Exception:
        value = ""
    return str(value or os.getenv(key, default) or default).strip()

API_URL = cfg("API_URL", API_URL_DEFAULT)
API_KEY = cfg("API_KEY", API_KEY_DEFAULT)

def api(action, **payload):
    try:
        r = requests.post(API_URL, json={"action": action, "api_key": API_KEY, **payload}, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"ok": False, "message": f"Koneksi Apps Script gagal: {e}"}

@st.cache_data(ttl=15, show_spinner=False)
def get_jadwal(unit, nama):
    return api("get_jadwal_pengawas", unit=unit, nama=nama)

def cek_akses(unit, nama):
    return api("cek_akses_hari_ini", unit=unit, nama=nama)

def logout():
    for k in ("logged_in", "nama", "unit", "access_date"):
        st.session_state.pop(k, None)
    st.rerun()

def login_screen():
    st.markdown("""
    <style>
    .stApp{background:#ffffff;color:#111111}
    .block-container{max-width:560px;padding-top:2.2rem;padding-bottom:2rem}
    .login-card{background:#fff!important;border:1px solid #d9d9d9;border-radius:12px;padding:22px}
    .brand{text-align:center;margin-bottom:16px}
    .brand h1{font-size:24px;margin:6px 0;color:#111}
    .brand p{font-size:14px;margin:0;color:#333}
    .brand small{color:#666}
    .login-card label,.login-card p,.login-card span{color:#111!important}
    .login-card div[data-baseweb="select"] > div{background:#fff!important;color:#111!important;border:1px solid #bdbdbd!important}
    .login-card div[data-baseweb="select"] input{color:#111!important;background:#fff!important}
    .login-card div[data-baseweb="select"] svg{fill:#111!important}
    .login-card div[role="listbox"]{background:#fff!important;color:#111!important;border:1px solid #bdbdbd!important}
    .login-card div[role="option"]{background:#fff!important;color:#111!important}
    .login-card div[role="option"]:hover{background:#f2f2f2!important;color:#111!important}
    </style>
    <div class="brand">
      <div style="font-size:30px">🏫</div>
      <h1>Presensi Pengawas Ujian</h1>
      <p>Pondok Modern Al-Ghozali · 2026–2027</p>
      <small>Pilih jenjang dan nama sesuai jadwal hari ini.</small>
    </div>
    <div class="login-card">
    """, unsafe_allow_html=True)

    unit = st.selectbox("Jenjang", ["SMA", "SMP"])
    nama = st.selectbox("Nama Pengawas", MASTER_PENGAWAS)

    if st.button("Masuk", type="primary", use_container_width=True):
        res = cek_akses(unit, nama)
        if res.get("ok"):
            st.session_state.update(
                logged_in=True,
                nama=nama,
                unit=unit,
                access_date=res.get("tanggal", "")
            )
            st.rerun()
        else:
            st.error(res.get("message", "Anda tidak memiliki jadwal pengawasan hari ini."))

    st.markdown("</div>", unsafe_allow_html=True)

def waktu_sekarang():
    return datetime.now(ZoneInfo("Asia/Jakarta"))

def jadwal_realtime(df):
    now = waktu_sekarang()
    hari_map = {"Monday":"SENIN", "Tuesday":"SELASA", "Wednesday":"RABU", "Thursday":"KAMIS", "Friday":"JUMAT", "Saturday":"SABTU", "Sunday":"MINGGU"}
    hari_ini = hari_map[now.strftime("%A")]
    tanggal_ini = now.strftime("%d/%m/%Y")
    hari_col = df["HARI"].astype(str).str.upper().str.strip()
    tanggal_col = df["TANGGAL"].astype(str).str.strip()
    today = df[(tanggal_col == tanggal_ini) & (hari_col == hari_ini)].copy()
    if today.empty:
        return today, None, now, hari_ini, tanggal_ini
    def jam_int(v):
        try:
            return int(float(v))
        except Exception:
            return 0
    today["_jam"] = today["JAM_KE"].map(jam_int)
    # Jadwal per jam ke: slot berjalan berdasarkan jam pelajaran, dengan toleransi tampilan.
    slot = None
    if not today.empty:
        first = int(today["_jam"].min())
        last = int(today["_jam"].max())
        # JAM KE dipakai sebagai urutan realtime; slot aktif = jam ke terakhir yang sudah dimulai.
        elapsed = now.hour * 60 + now.minute
        # Rentang perkiraan slot berdasarkan nomor jam: 07:00 + (jam-1)*50 menit.
        for j in sorted(today["_jam"].unique()):
            start = 7 * 60 + (int(j) - 1) * 50
            end = start + 50
            if start <= elapsed < end:
                slot = j
                break
    return today, slot, now, hari_ini, tanggal_ini

def main_app():
    unit, nama = st.session_state.unit, st.session_state.nama
    st.markdown("""
    <style>
    .stApp{background:#fff;color:#111}
    .block-container{max-width:1100px;padding-top:1.4rem}
    h1{font-size:25px!important;color:#111!important}
    h2{font-size:20px!important;color:#111!important}
    h3{font-size:17px!important;color:#111!important}
    p,span,label{color:#111}
    div[data-baseweb="select"] > div{background:#fff!important;color:#111!important;border:1px solid #bdbdbd!important}
    div[data-baseweb="select"] input{color:#111!important;background:#fff!important}
    div[data-baseweb="select"] svg{fill:#111!important}
    div[role="listbox"]{background:#fff!important;color:#111!important}
    div[role="option"]{background:#fff!important;color:#111!important}
    div[role="option"]:hover{background:#f2f2f2!important;color:#111!important}
    </style>
    """, unsafe_allow_html=True)
    c1, c2 = st.columns([5, 1])
    with c1:
        st.title("📝 Presensi Pengawas")
        st.caption(f"{unit} · {nama}")
    with c2:
        if st.button("Keluar", use_container_width=True):
            logout()

    tabs = st.tabs(["📌 Presensi", "📅 Jadwal Saya", "📊 Rekap"])
    jadwal = get_jadwal(unit, nama)
    if not jadwal.get("ok"):
        st.error(jadwal.get("message", "Jadwal gagal dimuat."))
        return
    df = pd.DataFrame(jadwal.get("data", []))
    if df.empty:
        st.warning("Belum ada jadwal untuk pengawas ini.")
        return

    with tabs[0]:
        st.subheader("Input Kehadiran")
        today_df, active_slot, now, hari_ini, tanggal_ini = jadwal_realtime(df)
        st.caption(f"🕐 Waktu Jakarta: {now.strftime('%d/%m/%Y %H:%M:%S')} · {hari_ini}")
        if today_df.empty:
            st.info("Tidak ada jadwal pengawasan Anda pada hari ini.")
            return
        today_df = today_df.sort_values(["_jam"] if "_jam" in today_df.columns else ["JAM_KE"])
        if active_slot is not None:
            active = today_df[today_df["_jam"] == active_slot]
            if not active.empty:
                st.success(f"🔴 **JADWAL SEDANG BERLANGSUNG — JAM KE {active_slot}**")
                st.dataframe(active.drop(columns=["_jam"], errors="ignore").rename(columns={"TANGGAL":"Tanggal","HARI":"Hari","JAM_KE":"Jam Ke","RUANG":"Ruang","NAMA_PENGAWAS":"Pengawas"}), use_container_width=True, hide_index=True)
        else:
            st.info("Belum masuk jam pengawasan. Jadwal hari ini tetap ditampilkan di bawah.")
        day = today_df
        opts = [f"Ruang {r.RUANG} · Jam {r.JAM_KE} · {r.HARI}" for _, r in day.iterrows()]
        choice = st.selectbox("Jadwal", opts)
        row = day.iloc[opts.index(choice)].to_dict()
        with st.container(border=True):
            st.write(f"**Ruang:** {row['RUANG']}  |  **Jam:** {row['JAM_KE']}  |  **Hari:** {row['HARI']}")
            st.write(f"**Pengawas terjadwal:** {row['NAMA_PENGAWAS']}")
            status = st.radio("Status", ["HADIR", "IZIN", "SAKIT", "ALPA", "DIGANTIKAN"], horizontal=True)
            pengganti = st.text_input("Nama Pengawas Pengganti") if status == "DIGANTIKAN" else ""
            if st.button("💾 Simpan Presensi", type="primary", use_container_width=True):
                if status == "DIGANTIKAN" and not pengganti.strip():
                    st.error("Nama pengawas pengganti wajib diisi.")
                else:
                    res = api("checkin", unit=unit, nama=nama, tanggal=str(row["TANGGAL"]), hari=str(row["HARI"]),
                              jam_ke=str(row["JAM_KE"]), ruang=str(row["RUANG"]), status=status,
                              pengganti=pengganti.strip())
                    if res.get("ok"):
                        st.success(res.get("message", "Presensi tersimpan."))
                        get_jadwal.clear()
                    else:
                        st.error(res.get("message", "Presensi gagal disimpan."))

    with tabs[1]:
        st.subheader("Jadwal Pengawasan Saya")
        today_df, active_slot, now, hari_ini, tanggal_ini = jadwal_realtime(df)
        st.caption(f"🔄 Real-time · diperbarui otomatis setiap 15 detik · {now.strftime('%H:%M:%S')} WIB")
        if not today_df.empty:
            if active_slot is not None:
                st.success(f"🔴 Sedang berlangsung: JAM KE {active_slot}")
            st.dataframe(
                today_df.drop(columns=["_jam"], errors="ignore").rename(columns={"TANGGAL":"Tanggal","HARI":"Hari","JAM_KE":"Jam Ke","RUANG":"Ruang","NAMA_PENGAWAS":"Pengawas"}),
                use_container_width=True, hide_index=True
            )
        else:
            st.info("Tidak ada jadwal Anda untuk hari ini.")

    with tabs[2]:
        st.subheader("Rekap Presensi")
        res = api("get_rekap", unit=unit, nama=nama)
        if res.get("ok"):
            rec = pd.DataFrame(res.get("data", []))
            if rec.empty:
                st.info("Belum ada data presensi.")
            else:
                st.dataframe(rec, use_container_width=True, hide_index=True)
        else:
            st.error(res.get("message", "Rekap gagal dimuat."))

if st.session_state.get("logged_in"):
    main_app()
else:
    login_screen()
