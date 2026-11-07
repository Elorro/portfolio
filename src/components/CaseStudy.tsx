import type { ValidationResult } from '@/content/validate';
import type { Dictionary } from '@/i18n/dictionaries/es';
import { MarkdownBody } from './MarkdownBody';

export function CaseStudy({ documents, dictionary }: { documents: ValidationResult['documents']; dictionary: Dictionary }) {
  const entries = documents.filter(({ document, body }) => document.case_study && body);
  if (!entries.length) return null;
  return <section id="case-study" aria-labelledby="case-study-title"><h2 id="case-study-title">{dictionary.caseStudy}</h2>{entries.map(({ document, body }) => <article key={document.slug}><h3>{document.title}</h3><MarkdownBody body={body ?? ''} /><a href={`#project-${document.slug}`}>{dictionary.backToProject}</a></article>)}</section>;
}
