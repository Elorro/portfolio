import { afterEach, describe, expect, it } from 'vitest';
import { aggregateHero } from '../src/content/aggregate';
import { documentsForLang } from '../src/content/documents-for-lang';
import { loadContent } from '../src/content/load';

const previousContentSource = process.env.CONTENT_SOURCE;
afterEach(() => {
  if (previousContentSource === undefined) delete process.env.CONTENT_SOURCE;
  else process.env.CONTENT_SOURCE = previousContentSource;
});

describe('content per language', () => {
  it('filters by language and reports a duplicate slug in that language', async () => {
    process.env.CONTENT_SOURCE = 'fixtures';
    const { documents } = await loadContent();
    const spanish = documentsForLang(documents, 'es');
    expect(spanish.every(({ document }) => document.lang === 'es')).toBe(true);
    expect(() => documentsForLang([...spanish, spanish[0]!], 'es')).toThrow(
      'documentsForLang: slug duplicado "amber-orbit" en "es"',
    );
  });

  it('rejects duplicate project slugs in hero aggregation', () => {
    const project = { slug: 'duplicate-project', links: {}, metrics: [] };
    expect(() => aggregateHero([project, project])).toThrow(
      'aggregateHero: slug duplicado "duplicate-project"; filtra por idioma antes de agregar',
    );
  });

  it('produces equal bilingual fixture aggregates without duplicate slugs', async () => {
    process.env.CONTENT_SOURCE = 'fixtures';
    const { documents } = await loadContent();
    const spanish = documentsForLang(documents, 'es');
    const english = documentsForLang(documents, 'en');
    const spanishAggregate = aggregateHero(spanish.map(({ document }) => document));
    const englishAggregate = aggregateHero(english.map(({ document }) => document));

    expect(spanishAggregate).toEqual(englishAggregate);
    expect(new Set(spanishAggregate.testsPassing.byProject.map(({ slug }) => slug)).size)
      .toBe(spanishAggregate.testsPassing.byProject.length);
    expect(new Set(spanishAggregate.demoVerifiedByProject.map(({ slug }) => slug)).size)
      .toBe(spanishAggregate.demoVerifiedByProject.length);
    const uniqueSpanishTests = new Map<string, number>();
    for (const { document } of spanish) {
      const metric = document.metrics.find((entry) => entry.id === 'tests_passing' && entry.epistemic === 'medido' && typeof entry.value === 'number');
      if (metric && typeof metric.value === 'number') uniqueSpanishTests.set(document.slug, metric.value);
    }
    expect(spanishAggregate.testsPassing.total).toBe(
      [...uniqueSpanishTests.values()].reduce((total, value) => total + value, 0),
    );
  });

  it('returns only the requested language from the real fixture loader', async () => {
    process.env.CONTENT_SOURCE = 'fixtures';
    const { documents } = await loadContent();
    expect(documentsForLang(documents, 'es').every(({ document }) => document.lang === 'es')).toBe(true);
    expect(documentsForLang(documents, 'en').every(({ document }) => document.lang === 'en')).toBe(true);
  });
});
