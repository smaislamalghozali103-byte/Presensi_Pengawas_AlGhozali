import React, { useState } from 'react';
import { UnitSekolah, UserSession } from '../types';
import { MASTER_PENGAWAS } from '../data/schedule';
import { cekAksesHariIni } from '../services/api';
import { School, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [unit, setUnit] = useState<UnitSekolah>('SMA');
  const [nama, setNama] = useState<string>(MASTER_PENGAWAS[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await cekAksesHariIni(unit, nama);
      if (res.ok) {
        onLogin({
          unit,
          nama,
          accessDate: res.tanggal || '21/09/2026',
        });
      } else {
        setErrorMsg(res.message || 'Anda tidak memiliki jadwal pengawasan hari ini.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kendala saat memeriksa akses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-3">
            <School className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Presensi Pengawas Ujian</h1>
          <p className="text-sm text-gray-600 font-medium mt-1">Pondok Modern Al-Ghozali · 2026–2027</p>
          <p className="text-xs text-gray-500 mt-1">Pilih jenjang dan nama sesuai jadwal hari ini.</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="select-jenjang">
              Jenjang
            </label>
            <select
              id="select-jenjang"
              value={unit}
              onChange={(e) => setUnit(e.target.value as UnitSekolah)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="SMA">SMA</option>
              <option value="SMP">SMP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="select-nama">
              Nama Pengawas
            </label>
            <select
              id="select-nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {MASTER_PENGAWAS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors duration-150 disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memeriksa Jadwal...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
