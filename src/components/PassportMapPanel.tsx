import { Map as MapIcon } from 'lucide-react';
import type { Spot } from '@/lib/types';
import { COUNTRIES_TOTAL } from '@/lib/data';
import { WorldMap } from './WorldMap';

interface Props {
  lang: string;
  visitedSpots: Spot[];
}

export function PassportMapPanel({ lang, visitedSpots }: Props) {
  const isEus = lang === 'EUS';
  const visitedCountries = new Set(visitedSpots.map((s) => s.country_code)).size;
  const worldPct = ((visitedCountries / COUNTRIES_TOTAL) * 100).toFixed(1);

  return (
    <section className="mb-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate-800 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <MapIcon className="w-5 h-5 text-forest-600 dark:text-forest-300" />
        <h2 className="font-display text-xl font-700 text-forest-800 dark:text-sand-100">
          {isEus ? 'Nire mapa' : 'Mi mapa'}
        </h2>
      </div>
      <p className="mb-5 font-display text-3xl font-700 text-forest-700 dark:text-forest-300">
        {worldPct}%{' '}
        <span className="text-sm font-500 text-forest-700/60 dark:text-sand-300/60">
          {isEus ? 'Mundua esploratua' : 'del Mundo explorado'} ({visitedCountries}/{COUNTRIES_TOTAL} {isEus ? 'herrialde' : 'países'})
        </span>
      </p>
      <WorldMap spots={visitedSpots} lang={lang} />
    </section>
  );
}
