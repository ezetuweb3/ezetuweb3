import { Fragment, type ReactNode } from 'react';
import { useApp, type RankingsFilter } from '@/lib/app-context';
import { continentOf } from '@/lib/data';
import { geoLabel } from '@/lib/geo';
import type { Spot } from '@/lib/types';
import { flagEmoji, getLocalizedCountry } from '@/lib/utils';
import { Ikurrina } from './Ikurrina';

interface Props {
  spot: Spot;
  tone?: 'onDark' | 'onLight';
  className?: string;
}

const TONE = {
  onDark: 'text-white/85 hover:text-white hover:bg-white/15',
  onLight: 'text-forest-700 dark:text-sand-300 hover:text-forest-900 dark:hover:text-sand-100 hover:bg-forest-100/70 dark:hover:bg-slate2-800',
};

export function PlaceBreadcrumb({ spot, tone = 'onLight', className = '' }: Props) {
  const { lang, navigateToRankings } = useApp();
  const country = getLocalizedCountry(spot, lang);
  const countryCode = spot.euskal_herria ? 'EUS' : spot.country_code;
  const continent = continentOf(spot.country_code) ?? 'all';

  const base: RankingsFilter = {
    continent,
    country: countryCode,
    province: 'all',
  };

  const provinces = spot.provinces && spot.provinces.length > 0
    ? spot.provinces
    : (spot.province ? [spot.province] : []);

  const countryChip: { key: string; label: string; icon?: ReactNode; filter: RankingsFilter } = {
    key: 'country',
    label: country.name,
    icon: country.isEH ? <Ikurrina className="w-3.5 h-2" /> : <span>{flagEmoji(spot.country_code)}</span>,
    filter: base,
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-0.5 text-xs ${TONE[tone]} ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); navigateToRankings(countryChip.filter); }}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer underline-offset-2 hover:underline transition-colors"
      >
        {countryChip.icon}
        {countryChip.label}
      </button>

      {provinces.length > 0 && <span aria-hidden="true" className="opacity-50 px-0.5">›</span>}
      {provinces.map((prov, i) => (
        <Fragment key={prov}>
          {i > 0 && <span aria-hidden="true" className="opacity-50 px-0.5">&</span>}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigateToRankings({ ...base, province: prov }); }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer underline-offset-2 hover:underline transition-colors"
          >
            <span aria-hidden="true">📍</span>
            {geoLabel(prov, lang)}
          </button>
        </Fragment>
      ))}

    </span>
  );
}
