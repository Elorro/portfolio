import type { ValidationResult } from '@/content/validate';
import { aggregateHero } from '@/content/aggregate';
import type { Dictionary } from '@/i18n/dictionaries/es';
import { formatDateUTC } from '@/i18n/date';

export function Hero({ documents, dictionary, lang = 'es' }: { documents: ValidationResult['documents']; dictionary: Dictionary; lang?: 'es' | 'en' }) {
  const data = aggregateHero(documents.map(({ document }) => document));
  const measures = [
    { label: dictionary.testsPassing, value: data.testsPassing.byProject.length ? data.testsPassing.total : '—', date: data.testsPassing.byProject[0]?.asOf, details: data.testsPassing.byProject.map((row) => `${row.slug}: ${row.value} (${row.asOf})`) },
    { label: dictionary.demosWithVerifiedLink, value: data.demoVerifiedByProject.length ? data.demoVerified : '—', date: data.demoVerifiedByProject[0]?.asOf, details: data.demoVerifiedByProject.map((row) => `${row.slug} (${row.asOf})`) },
    { label: dictionary.oldestMeasured, value: data.oldestAsOf ?? '—', date: data.oldestAsOf, details: [] },
  ];
  return <section className="hero"><div className="hero-glow" aria-hidden="true" /><h1>{dictionary.portfolio}</h1><p className="hero-subtitle">{dictionary.heroSubtitle}</p><div className="hero-metrics">{measures.map((measure) => <article key={measure.label}><h2>{measure.label}</h2><strong>{measure.value ?? '—'}</strong>{measure.date ? <p><time dateTime={measure.date}>{formatDateUTC(measure.date, lang)}</time></p> : <p>{dictionary.noMeasuredData}</p>}{measure.details.length ? <details><summary>{dictionary.projectBreakdown}</summary><ul>{measure.details.map((line) => <li key={line}>{line}</li>)}</ul></details> : null}</article>)}</div></section>;
}
