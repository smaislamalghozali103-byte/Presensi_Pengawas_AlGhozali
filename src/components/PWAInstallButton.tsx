import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Apple } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'login';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as standalone PWA, hide install trigger
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Desktop prompt available
  if (isInstallable) {
    if (variant === 'login') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold transition-all shadow-2xs group"
        >
          <Smartphone className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
          <span>{installing ? 'Memproses Instalasi...' : 'Install Aplikasi di HP / Komputer (PWA)'}</span>
          <Download className="w-3.5 h-3.5 text-emerald-700" />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={installing}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all shadow-2xs hover:shadow-xs"
        title="Pasang aplikasi di layar utama HP / Komputer"
      >
        <Download className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'login' ? (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Apple className="w-4 h-4 text-slate-800" />
            <span>Install di iPhone / iPad</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-all shadow-2xs"
          >
            <Apple className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install iOS</span>
          </button>
        )}

        {/* Guided Modal for iOS Safari */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Install di iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs text-gray-700 leading-relaxed">
                <div className="flex items-start gap-2.5 p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center text-2xs">
                    1
                  </span>
                  <span>
                    Buka browser <strong>Safari</strong> lalu ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah layar browser.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center text-2xs">
                    2
                  </span>
                  <span>
                    Gulir ke bawah dan pilih menu <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center text-2xs">
                    3
                  </span>
                  <span>
                    Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon Presensi Pengawas akan muncul di menu HP Anda!
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default PWAInstallButton;
