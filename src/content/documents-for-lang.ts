import type { ValidationResult } from './validate';

type ContentEntry = ValidationResult['documents'][number];

export function documentsForLang(
  documents: ContentEntry[],
  lang: 'es' | 'en',
): ContentEntry[] {
  const filtered = documents.filter(({ document }) => document.lang === lang);
  const slugs = new Set<string>();
  for (const { document } of filtered) {
    if (slugs.has(document.slug)) {
      throw new Error(`documentsForLang: slug duplicado "${document.slug}" en "${lang}"`);
    }
    slugs.add(document.slug);
  }
  return filtered;
}
