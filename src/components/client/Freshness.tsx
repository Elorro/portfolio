'use client';

import { useEffect, useState } from 'react';
import { STALE_DAYS } from '@/content/constants';
import { formatDateUTC } from '@/i18n/date';

const DAY_MS = 86_400_000;
export function isStale(asOf: string, now: Date): boolean {
  const date = new Date(`${asOf}T00:00:00.000Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return today - date.getTime() > STALE_DAYS * DAY_MS;
}

export function Freshness({ asOf, notice, lang = 'es' }: { asOf: string; notice: string; lang?: 'es' | 'en' }) {
  const [stale, setStale] = useState(false);
  useEffect(() => setStale(isStale(asOf, new Date())), [asOf]);
  return <><time dateTime={asOf}>{formatDateUTC(asOf, lang)}</time>{stale ? <span className="freshness-note"> {notice}</span> : null}</>;
}
