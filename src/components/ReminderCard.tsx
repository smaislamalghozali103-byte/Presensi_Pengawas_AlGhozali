import React from 'react';
import { BERITA_ACARA_URL, REMINDER_PENGAWAS_POINTS } from '../data/schedule';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  FolderArchive,
  Sparkles,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

interface ReminderCardProps {
  compact?: boolean;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ compact = false }) => {
  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-2xs flex-shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-1.5">
              <span>📌 R E M I N D E R & SOP PENGAWAS UJIAN</span>
            </h3>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Panitia Penilaian Sumatif TP 2026-2027 · Pondok Modern Al-Ghozali
            </p>
          </div>
        </div>

        {/* Action Button to Google Form Berita Acara */}
        <a
          href={BERITA_ACARA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow self-start sm:self-auto group ring-1 ring-amber-600/30"
        >
          <FileText className="w-4 h-4" />
          <span>Isi Berita Acara Ujian</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Reminder Checklist Items */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div className="flex items-start gap-2.5 p-2.5 bg-white/90 border border-amber-100 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-800 leading-snug">
            <strong>Pisahkan LJK perkelas</strong> dan urutkan LJK dari nomor absen terkecil ke yang terbesar.
          </span>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-white/90 border border-amber-100 rounded-xl">
          <FolderArchive className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-800 leading-snug">
            Lembar jawaban yang telah rapi <strong>dimasukkan ke dalam map coklat</strong> yang disediakan.
          </span>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-white/90 border border-amber-100 rounded-xl">
          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-800 leading-snug">
            Wajib <strong>mengisi Berita Acara Ujian</strong> melalui link Google Form yang telah disiapkan.
          </span>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-white/90 border border-amber-100 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-800 leading-snug">
            <strong>Menjaga kebersihan dan ketertiban</strong> ruangan ujian sebelum dan sesudah sesi.
          </span>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 bg-white/90 border border-amber-100 rounded-xl md:col-span-2">
          <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-800 leading-snug">
            <strong>Mengecek kembali jumlah dan kelengkapan lembar jawaban</strong> sebelum diserahkan ke panitia.
          </span>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-2xs text-amber-900/80">
        <span>Jazakumullahu Khairan Katsiran atas dedikasi dan kerja samanya 🙏🏻😇</span>
        <span className="font-semibold text-amber-950">Ttd. Panitia Penilaian Sumatif 26-27</span>
      </div>
    </div>
  );
};

export default ReminderCard;
