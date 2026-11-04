import { useState } from 'react';
import { X, Flag, Check } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { submitReport } from '@/lib/data';
import type { ReportReason } from '@/lib/types';

const REASONS: { key: ReportReason; icon: string }[] = [
  { key: 'ai_generated', icon: '🤖' },
  { key: 'fake_place', icon: '🗺️' },
  { key: 'wrong_place', icon: '📍' },
  { key: 'people_selfie', icon: '👤' },
  { key: 'plagiarism', icon: '📸' },
];

const reasonLabelKey: Record<ReportReason, string> = {
  ai_generated: 'reportReasonAi',
  fake_place: 'reportReasonFake',
  wrong_place: 'reportReasonWrong',
  people_selfie: 'reportReasonPeople',
  plagiarism: 'reportReasonPlagiarism',
};

export function ReportModal({ photoId, onClose }: { photoId: string; onClose: () => void }) {
  const { t } = useApp();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport(photoId, reason, details.trim() || null);
      setDone(true);
    } catch {
      setError('Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3100] grid place-items-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-sand-50 dark:bg-slate2-900 shadow-lift overflow-hidden animate-popIn">
        <div className="flex items-center justify-between p-5 border-b border-forest-100 dark:border-slate2-800">
          <h2 className="font-display text-lg font-700 text-forest-800 dark:text-sand-100 flex items-center gap-2">
            <Flag className="w-5 h-5 text-terracotta-500" />
            {t('reportTitle')}
          </h2>
          <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-full hover:bg-forest-100 dark:hover:bg-slate2-800 text-forest-700 dark:text-sand-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-900 grid place-items-center mx-auto mb-4">
              <Check className="w-7 h-7 text-forest-600 dark:text-forest-300" />
            </div>
            <p className="text-sm font-600 text-forest-800 dark:text-sand-100 leading-relaxed">
              {t('reportSubmitted')}
            </p>
            <button onClick={onClose} className="mt-5 px-6 py-2 rounded-xl bg-forest-600 text-white text-sm font-600 hover:bg-forest-700 transition-colors">
              {t('close')}
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setReason(r.key)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-colors ${
                    reason === r.key
                      ? 'border-terracotta-400 bg-terracotta-50 dark:bg-terracotta-900/20'
                      : 'border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 hover:border-forest-300'
                  }`}
                >
                  <span className="text-xl shrink-0">{r.icon}</span>
                  <span className="text-sm font-500 text-forest-800 dark:text-sand-100 leading-snug">
                    {t(reasonLabelKey[r.key])}
                  </span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">
                {t('reportDetails')}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                rows={3}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-sm text-forest-800 dark:text-sand-100 outline-none focus:border-forest-400 resize-none"
              />
              <p className="text-[11px] text-forest-700/40 dark:text-sand-300/40 text-right mt-1">{details.length}/500</p>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-forest-100 dark:border-slate2-800 text-forest-700 dark:text-sand-300 font-600 text-sm hover:bg-forest-50 dark:hover:bg-slate2-850 transition-colors">
                {t('cancel')}
              </button>
              <button
                onClick={submit}
                disabled={!reason || submitting}
                className="flex-1 py-2.5 rounded-xl bg-terracotta-500 text-white font-600 text-sm disabled:opacity-40 hover:bg-terracotta-600 transition-colors"
              >
                {submitting ? '...' : t('reportSubmit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
