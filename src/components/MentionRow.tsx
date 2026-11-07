import type { ContentDocument } from '@/content/schema';
import type { Dictionary } from '@/i18n/dictionaries/es';

export function MentionRow({ item, dictionary }: { item: ContentDocument; dictionary: Dictionary }) {
  return <article id={`project-${item.slug}`} className="mention-row"><h3>{item.title}</h3><p>{item.tagline}</p><p><span className="status-badge">{dictionary.status}: {dictionary[item.status] ?? item.status}</span></p><p><strong>{dictionary.honestLimit}:</strong> {item.honest_limit}</p></article>;
}
