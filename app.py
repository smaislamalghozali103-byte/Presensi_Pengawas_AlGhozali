import os
import requests
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Presensi Pengawas Al-Ghozali v2", page_icon="📝", layout="wide")
APP_VERSION = "2.1.0"

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

@st.cache_data(ttl=120, show_spinner=False)
def get_jadwal(unit, nama):
    return api("get_jadwal_pengawas", unit=unit, nama=nama)

def logout():
    for k in ("logged_in", "nama", "unit"):
        st.session_state.pop(k, None)
    st.rerun()

def login_screen():
    st.markdown("""
    <style>
    .stApp{background:linear-gradient(135deg,#f8fafc,#eef6ff,#fff)}
    .block-container{max-width:850px;padding-top:4rem}
    .brand{text-align:center;margin-bottom:22px}.brand h1{color:#0f172a}
    .brand p{color:#64748b}.card{background:#fff;border:1px solid #e2e8f0;
    border-radius:22px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.08)}
    </style>
    <div class="brand"><div style="font-size:46px">🏫</div>
    <h1>Presensi Pengawas Ujian</h1>
    <p>Pondok Modern Al-Ghozali · Tahun Pelajaran 2026–2027</p>
    <small style="color:#94a3b8">v2.1 · Master pengawas tertanam di aplikasi</small></div>
    <div class="card">
    """, unsafe_allow_html=True)

    unit = st.selectbox("Jenjang", ["SMA", "SMP"])
    st.caption(f"Master pengawas aplikasi: {len(MASTER_PENGAWAS)} nama · Sumber: kode aplikasi")
    tab_login, tab_daftar = st.tabs(["🔐 Login", "🔑 Pendaftaran PIN"])

    with tab_login:
        nama = st.selectbox("Nama Pengawas", MASTER_PENGAWAS, key="login_nama")
        pin = st.text_input("PIN", type="password", max_chars=20, key="login_pin")
        if st.button("Masuk", type="primary", use_container_width=True):
            if not pin.isdigit() or len(pin) < 6:
                st.error("PIN harus berupa angka minimal 6 digit.")
            else:
                res = api("login", unit=unit, nama=nama, pin=pin)
                if res.get("ok"):
                    st.session_state.update(logged_in=True, nama=nama, unit=unit)
                    st.rerun()
                else:
                    st.error(res.get("message", "Login gagal."))

    with tab_daftar:
        nama = st.selectbox("Nama Pengawas", MASTER_PENGAWAS, key="reg_nama")
        pin1 = st.text_input("PIN Baru", type="password", max_chars=20, key="reg_pin1")
        pin2 = st.text_input("Ulangi PIN", type="password", max_chars=20, key="reg_pin2")
        if st.button("Simpan PIN", type="primary", use_container_width=True):
            if not pin1.isdigit() or len(pin1) < 6:
                st.error("PIN minimal 6 digit dan hanya angka.")
            elif pin1 != pin2:
                st.error("Konfirmasi PIN tidak sama.")
            else:
                res = api("register_pin", unit=unit, nama=nama, pin=pin1)
                if res.get("ok"):
                    st.success(res.get("message", "PIN berhasil disimpan."))
                else:
                    st.error(res.get("message", "Pendaftaran PIN gagal."))

    st.markdown("</div>", unsafe_allow_html=True)

def main_app():
    unit, nama = st.session_state.unit, st.session_state.nama
    st.markdown("<style>.stApp{background:#f8fafc}.block-container{max-width:1250px}</style>", unsafe_allow_html=True)
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
        tanggal = st.selectbox("Tanggal Ujian", sorted(df.TANGGAL.astype(str).unique()))
        day = df[df.TANGGAL.astype(str) == tanggal]
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
        st.dataframe(
            df.rename(columns={"TANGGAL":"Tanggal","HARI":"Hari","JAM_KE":"Jam Ke","RUANG":"Ruang","NAMA_PENGAWAS":"Pengawas"}),
            use_container_width=True, hide_index=True
        )

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
