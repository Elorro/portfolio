import type { ContentDocument } from '@/content/schema';
import type { Dictionary } from '@/i18n/dictionaries/es';
import { TiltCard } from './client/TiltCard';
import { MetricItem } from './MetricItem';
import { MarkdownBody } from './MarkdownBody';

export function ProjectCard({ item, dictionary, body = '', variant = 'small', lang = 'es' }: { item: ContentDocument; dictionary: Dictionary; body?: string; variant?: 'large' | 'medium' | 'small'; lang?: 'es' | 'en' }) {
  const secureLink = (value?: string) => value && /^https:\/\//.test(value) ? value : undefined;
  const content = <article id={`project-${item.slug}`} className={`project-card project-${variant}`}>
    <h3>{item.title}</h3><p>{item.tagline}</p>
    <p><span className="status-badge">{dictionary.status}: {dictionary[item.status] ?? item.status}</span></p>
    <h4>{dictionary.technology}</h4><ul className="stack-list">{item.stack.map((tech) => <li key={tech}>{tech}</li>)}</ul>
    <div className="project-links" aria-label={dictionary.ariaProjectLinks}>
      {secureLink(item.links.repo) ? <a href={secureLink(item.links.repo)} rel="noopener noreferrer">{dictionary.repository}</a> : null}
      {secureLink(item.links.live) ? <span><a href={secureLink(item.links.live)} rel="noopener noreferrer">{dictionary.liveDemo}</a>{item.live_caveat ? <span> — {item.live_caveat}</span> : null}</span> : null}
      {secureLink(item.links.api_docs) ? <a href={secureLink(item.links.api_docs)} rel="noopener noreferrer">{dictionary.apiDocumentation}</a> : null}
    </div>
    <section className="honest-limit"><h4>{dictionary.honestLimit}</h4><p>{item.honest_limit}</p></section>
    {item.metrics.length ? <div className="metric-list">{item.metrics.map((metric) => <MetricItem key={metric.id} metric={metric} dictionary={dictionary} lang={lang} />)}</div> : null}
    {item.case_study && body ? <details><summary>{dictionary.openDetails}</summary><MarkdownBody body={body} /></details> : null}
  </article>;
  return variant === 'large' || variant === 'medium' ? <TiltCard className="project-tilt">{content}</TiltCard> : content;
}
