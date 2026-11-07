import type { ContentDocument } from '@/content/schema';
import type { Dictionary } from '@/i18n/dictionaries/es';
import { ProjectCard } from './ProjectCard';

export function SupportCard(props: { item: ContentDocument; dictionary: Dictionary; body?: string; lang?: 'es' | 'en' }) {
  return <ProjectCard {...props} variant="small" />;
}
