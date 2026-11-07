import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { es } from '@/i18n/dictionaries/es';
import { en } from '@/i18n/dictionaries/en';
import { MetricItem } from '@/components/MetricItem';
import { ProjectCard } from '@/components/ProjectCard';
import { MarkdownBody } from '@/components/MarkdownBody';
import { Freshness, isStale } from '@/components/client/Freshness';
import { languageHref } from '@/components/client/LanguageLink';
import { aggregateHero } from '@/content/aggregate';
import { Hero } from '@/components/Hero';
import type { ContentDocument } from '@/content/schema';

const base: ContentDocument = {
  slug: 'fake-orbit', tier: 'central', size: 'large', order: 1, lang: 'es',
  title: 'Fictional', tagline: 'Fixture', status: 'prototype', stack: ['TypeScript'],
  links: {}, metrics: [], honest_limit: 'Synthetic limitation',
};
const measured = { id: 'tests_passing', label: 'Tests', value: 4, epistemic: 'medido' as const, source: 'Synthetic command', as_of: '2026-10-30', n: 8, recompute: 'npm test' };

describe('M2 synchronous rendering', () => {
  it('renders both epistemic badges, source, date, n and recompute conditionally', () => {
    const html = renderToString(<MetricItem metric={measured} dictionary={es} />);
    expect(html).toContain('Medido'); expect(html).toContain('dateTime="2026-10-30"');
    expect(html).toContain('Synthetic command'); expect(html).toContain('n = <!-- -->8'); expect(html).toContain('npm test');
    const declared = renderToString(<MetricItem metric={{ ...measured, epistemic: 'declarado', n: undefined, recompute: undefined }} dictionary={en} />);
    expect(declared).toContain('Declared'); expect(declared).not.toContain('n ='); expect(declared).not.toContain('<code>');
  });

  it('always renders honest limits and only safe links and live caveats', () => {
    for (const variant of ['large', 'medium', 'small'] as const) {
      const html = renderToString(<ProjectCard item={{ ...base, live_caveat: 'Synthetic caveat', links: { live: 'https://example.invalid/live', repo: 'http://unsafe.invalid' } }} dictionary={es} variant={variant} />);
      expect(html).toContain('Synthetic limitation'); expect(html).toContain('Synthetic caveat');
      expect(html).toContain('https://example.invalid/live'); expect(html).not.toContain('http://unsafe.invalid');
    }
    const noLive = renderToString(<ProjectCard item={base} dictionary={es} />);
    expect(noLive).toContain('Synthetic limitation'); expect(noLive).not.toContain('Synthetic caveat');
  });

  it('renders safe Markdown, shifts headings and substitutes image alt text', () => {
    const html = renderToString(<MarkdownBody body={'# Heading\n\n<script>alert(1)</script>\n\n[bad](javascript:alert) [good](https://example.invalid)\n\n![Alt fixture](/image.png)'} />);
    expect(html).toContain('<h3>Heading</h3>'); expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:'); expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('Alt fixture'); expect(html).not.toContain('<img');
  });

  it('keeps freshness date in SSR and calculates strict UTC 180/181-day boundaries', () => {
    const html = renderToString(<Freshness asOf="2026-01-01" notice="Stale notice" />);
    expect(html).toContain('2026-01-01'); expect(html).not.toContain('Stale notice');
    expect(isStale('2026-01-01', new Date('2026-06-30T00:00:00.000Z'))).toBe(false);
    expect(isStale('2026-01-01', new Date('2026-07-01T00:00:00.000Z'))).toBe(true);
  });

  it('adds only a valid locale hash', () => {
    expect(languageHref('/en', '#case-study')).toBe('/en#case-study');
    expect(languageHref('/en', '#bad/hash')).toBe('/en');
    expect(languageHref('/en', '#UPPER')).toBe('/en');
  });

  it('aggregates measured metrics only and exposes dates and demo breakdown', () => {
    const result = aggregateHero([
      { slug: 'a', links: { live: 'https://example.invalid' }, metrics: [measured, { ...measured, id: 'demo_verified', value: 1 }] },
      { slug: 'b', links: {}, metrics: [{ ...measured, value: 100, epistemic: 'declarado' }] },
    ]);
    expect(result.testsPassing.total).toBe(4); expect(result.demoVerified).toBe(1);
    expect(result.demoVerifiedByProject).toEqual([{ slug: 'a', asOf: '2026-10-30' }]);
    expect(result.oldestAsOf).toBe('2026-10-30');
    expect(aggregateHero([]).oldestAsOf).toBeNull();
    const hero = renderToString(<Hero documents={[]} dictionary={es} />);
    expect(hero).toContain('Demos con enlace verificado'); expect(hero).toContain('sin datos medidos');
    expect(hero.match(/—/g)).toHaveLength(3);
  });
});
