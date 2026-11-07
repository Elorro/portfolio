import type { Metric } from '@/content/schema';
import type { Dictionary } from '@/i18n/dictionaries/es';
import { Freshness } from './client/Freshness';

export function MetricItem({ metric, dictionary, lang = 'es' }: { metric: Metric; dictionary: Dictionary; lang?: 'es' | 'en' }) {
  return <div className="metric-item">
    <div className="metric-heading"><span>{metric.label}</span><span className={`epistemic epistemic-${metric.epistemic}`}>{metric.epistemic === 'medido' ? dictionary.measured : dictionary.declared}</span></div>
    <strong className="metric-value">{metric.value}</strong>
    <p>{dictionary.asOf}: <Freshness asOf={metric.as_of!} notice={dictionary.staleMetric} lang={lang} /></p>
    <p>{dictionary.source}: {metric.source}</p>
    {metric.n !== undefined ? <p>n = {metric.n}</p> : null}
    {metric.recompute ? <details><summary>{dictionary.recompute}</summary><code>{metric.recompute}</code></details> : null}
  </div>;
}
