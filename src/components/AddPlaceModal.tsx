import { useState } from 'react';
import { X, Search, MapPin, Star, MapPinPlus, ArrowRight, ArrowLeft, Sparkles, Footprints } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { searchAutocomplete, searchBroadRegions, insertSpot, type AutocompletePlace, type BroadRegion } from '@/lib/data';
import { flagEmoji, getLocalizedCountry } from '@/lib/utils';
import { Ikurrina } from './Ikurrina';
import type { Category } from '@/lib/types';

export function AddPlaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t, lang, prefilledComarca } = useApp();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompletePlace[]>([]);
  const [broadResults, setBroadResults] = useState<BroadRegion[]>([]);
  const [selected, setSelected] = useState<AutocompletePlace | null>(null);
  const [selectedBroad, setSelectedBroad] = useState<BroadRegion | null>(null);
  const [category, setCategory] = useState<Category>('village');
  const [ratings, setRatings] = useState({ photogenic: 0, tranquility: 0, accessibility: 0 });
  const [tip, setTip] = useState('');
  const [tipAuthor, setTipAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete search
  const onQueryChange = (q: string) => {
    setQuery(q);
    setResults(searchAutocomplete(q));
    setBroadResults(searchBroadRegions(q));
    setSelectedBroad(null);
  };

  const selectPlace = (p: AutocompletePlace) => {
    setSelected(p);
    setSelectedBroad(null);
    setCategory(p.category_hint);
    setQuery('');
    setResults([]);
    setBroadResults([]);
    setStep(2);
  };

  const selectBroadRegion = (region: BroadRegion) => {
    setSelectedBroad(region);
    setSelected(null);
    setQuery(region.name);
    setResults([]);
    setBroadResults([]);
  };

  const selectSubSpot = (subSpot: BroadRegion['sub_spots'][number]) => {
    selectPlace({
      name: subSpot.name,
      country: selectedBroad?.country ?? '',
      country_code: selectedBroad?.country_code ?? '',
      region: subSpot.province ?? selectedBroad?.name ?? '',
      euskal_herria: null,
      latitude: subSpot.coordinates[0],
      longitude: subSpot.coordinates[1],
      category_hint: subSpot.category_hint,
    });
  };

  const canSubmit = ratings.photogenic >= 1 && ratings.tranquility >= 1 && ratings.accessibility >= 1;

  const submit = async () => {
    if (!selected || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await insertSpot(selected, category, ratings, tip.trim() || null, tipAuthor);
      setStep(4);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    if (step === 4) onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-sand-50 dark:bg-slate2-900 shadow-lift animate-popIn">
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-forest-100 dark:border-slate2-800 bg-sand-50 dark:bg-slate2-900 z-10">
          <h2 className="font-display text-xl font-700 text-forest-800 dark:text-sand-100 flex items-center gap-2">
            <MapPinPlus className="w-5 h-5 text-terracotta-500" />
            {t('registerNewPlace')}
          </h2>
          <button onClick={close} className="grid place-items-center w-8 h-8 rounded-full hover:bg-forest-100 dark:hover:bg-slate2-800 text-forest-700 dark:text-sand-300"><X className="w-5 h-5" /></button>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-1.5 px-5 py-2.5 bg-forest-50/50 dark:bg-slate2-850/50">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-terracotta-500' : 'bg-forest-100 dark:bg-slate2-800'}`} />
            ))}
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* STEP 1: Search place */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('searchWorldwide')}</label>
                <div className="flex items-center gap-2 px-3 py-2.5 mt-2 rounded-2xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 focus-within:border-forest-400 transition-colors">
                  <Search className="w-4 h-4 text-forest-700/50 dark:text-sand-300/50" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder={t('searchWorldwide')}
                    className="flex-1 bg-transparent text-sm text-forest-800 dark:text-sand-100 outline-none placeholder:text-forest-700/40 dark:placeholder:text-sand-300/40"
                  />
                </div>
              </div>

              {broadResults.length > 0 && (
                <div className="rounded-2xl border border-terracotta-200 dark:border-terracotta-800/60 bg-terracotta-50/70 dark:bg-terracotta-950/20 overflow-hidden">
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-700 text-terracotta-700 dark:text-terracotta-300">🏞️ {lang === 'EUS' ? 'Eremu zabalak' : lang === 'EN' ? 'Broad areas' : 'Zonas amplias'}</div>
                  {broadResults.map((region) => (
                    <button key={region.id} onClick={() => selectBroadRegion(region)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left border-t border-terracotta-200/70 dark:border-terracotta-800/50 hover:bg-terracotta-100/70 dark:hover:bg-terracotta-900/30 transition-colors">
                      <MapPin className="w-4 h-4 text-terracotta-600 dark:text-terracotta-300 shrink-0" />
                      <span className="flex-1 text-sm font-600 text-forest-800 dark:text-sand-100">{region.name}</span>
                      <ArrowRight className="w-4 h-4 text-terracotta-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {selectedBroad && (
                <div className="space-y-3 rounded-2xl border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/20 p-3.5">
                  <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">{t('broadAreaWarning')}</p>
                  <p className="text-[11px] font-700 uppercase tracking-wider text-amber-800/70 dark:text-amber-200/70">{t('broadAreaPickOne')}</p>
                  <div className="space-y-1.5">
                    {selectedBroad.sub_spots.map((subSpot) => (
                      <button key={subSpot.name} onClick={() => selectSubSpot(subSpot)} className="w-full flex items-center gap-2.5 rounded-xl bg-white/80 dark:bg-slate2-900/70 border border-amber-200 dark:border-amber-800/60 px-3 py-2.5 text-left hover:border-terracotta-400 hover:shadow-soft transition-all">
                        <span className="text-base shrink-0">{subSpot.category_hint === 'nature' ? '🌲' : subSpot.category_hint === 'city' ? '🏙️' : '🏘️'}</span>
                        <span className="flex-1 min-w-0"><span className="block text-sm font-600 text-forest-800 dark:text-sand-100 truncate">{subSpot.name}</span><span className="block text-[11px] text-forest-700/60 dark:text-sand-300/60 truncate">{subSpot.description}</span></span>
                        <ArrowRight className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-900/60 dark:text-amber-200/60">{t('broadAreaOther')}</p>
                </div>
              )}

              {prefilledComarca && !query && !selectedBroad && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-forest-50 dark:bg-slate2-850 border border-forest-200 dark:border-slate2-700">
                  <MapPin className="w-4 h-4 text-forest-600 dark:text-forest-300 shrink-0" />
                  <span className="text-xs text-forest-700/70 dark:text-sand-300/70">
                    {t('comarca')}: <strong>{prefilledComarca}</strong>
                  </span>
                </div>
              )}

              {results.length > 0 && (
                <div className="rounded-2xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 overflow-hidden max-h-72 overflow-y-auto">
                  {results.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => selectPlace(p)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-forest-50 dark:hover:bg-slate2-800 transition-colors border-b border-forest-50 dark:border-slate2-800/50 last:border-0"
                    >
                      <span className="text-base shrink-0">{getLocalizedCountry(p, lang).isEH ? <Ikurrina className="w-4 h-2.5 inline-block" /> : flagEmoji(p.country_code)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-600 text-forest-800 dark:text-sand-100 truncate">{p.name}</div>
                        <div className="text-[11px] text-forest-700/50 dark:text-sand-300/50 truncate">
                          {getLocalizedCountry(p, lang).name} · {p.region}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-forest-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {query && results.length === 0 && broadResults.length === 0 && !selectedBroad && (
                <p className="text-xs text-forest-700/50 dark:text-sand-300/50">{t('noResults')}</p>
              )}
            </div>
          )}

          {/* STEP 2: Confirm category */}
          {step === 2 && selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-forest-50 dark:bg-slate2-850 border border-forest-200 dark:border-slate2-700">
                <MapPin className="w-4 h-4 text-forest-600 dark:text-forest-300 shrink-0" />
                <span className="text-sm font-600 text-forest-800 dark:text-sand-100">{selected.name}</span>
                {getLocalizedCountry(selected, lang).isEH ? <Ikurrina className="w-4 h-2.5" /> : <span className="text-base">{flagEmoji(selected.country_code)}</span>}
                <div className="ml-auto text-right text-[10px] text-forest-700/60 dark:text-sand-300/60">
                  <div>{selected.country}</div>
                  <div>{selected.region}</div>
                  <div>{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</div>
                </div>
              </div>

              <div>
                <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('selectCategory')}</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {([
                    { id: 'city', icon: '🏙️', label: t('cities') },
                    { id: 'village', icon: '🏘️', label: t('villages') },
                    { id: 'nature', icon: '🌲', label: t('nature') },
                  ] as const).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all ${
                        category === c.id
                          ? 'border-terracotta-400 bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-700 dark:text-terracotta-300'
                          : 'border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-forest-700/70 dark:text-sand-300/70 hover:border-forest-300'
                      }`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-xs font-600">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-forest-100 dark:border-slate2-800 text-forest-700 dark:text-sand-300 font-600 text-sm hover:bg-forest-50 dark:hover:bg-slate2-850 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t('back')}
                </button>
                <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-forest-600 text-white font-600 text-sm hover:bg-forest-700 transition-colors">
                  {t('next')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Initial review + tip */}
          {step === 3 && selected && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('initialReview')}</label>
                <div className="space-y-2.5 mt-3">
                  {(['photogenic', 'tranquility', 'accessibility'] as const).map((k) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="text-sm w-28 text-forest-700/80 dark:text-sand-300/80">{t(k)}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setRatings((p) => ({ ...p, [k]: n }))} className="p-0.5">
                            <Star className={`w-5 h-5 transition-colors ${n <= ratings[k] ? 'fill-terracotta-500 text-terracotta-500' : 'text-forest-300 dark:text-slate2-700'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('optionalTip')}</label>
                <input
                  value={tip}
                  onChange={(e) => setTip(e.target.value.slice(0, 140))}
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-sm text-forest-800 dark:text-sand-100 outline-none focus:border-forest-400"
                />
                <p className="text-[11px] text-forest-700/40 dark:text-sand-300/40 text-right mt-0.5">{tip.length}/140</p>
              </div>

              <div>
                <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('authorName')}</label>
                <input
                  value={tipAuthor}
                  onChange={(e) => setTipAuthor(e.target.value.slice(0, 40))}
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-sm text-forest-800 dark:text-sand-100 outline-none focus:border-forest-400"
                />
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-forest-100 dark:border-slate2-800 text-forest-700 dark:text-sand-300 font-600 text-sm hover:bg-forest-50 dark:hover:bg-slate2-850 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t('back')}
                </button>
                <button
                  onClick={submit}
                  disabled={!canSubmit || submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-terracotta-500 text-white font-600 text-sm disabled:opacity-40 hover:bg-terracotta-600 transition-colors"
                >
                  {submitting ? '...' : <><Sparkles className="w-4 h-4" /> {t('registerNewPlace')}</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900 grid place-items-center mx-auto animate-popIn">
                <Footprints className="w-8 h-8 text-forest-600 dark:text-forest-300" />
              </div>
              <p className="font-600 text-forest-800 dark:text-sand-100 text-sm max-w-xs mx-auto leading-relaxed">{t('placeUnlocked')}</p>
              <button onClick={close} className="px-6 py-2.5 rounded-xl bg-forest-600 text-white font-600 text-sm hover:bg-forest-700 transition-colors">
                {t('close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
