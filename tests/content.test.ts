import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { aggregateHero } from '../src/content/aggregate';
import { checkContentDirectory } from '../src/content/check';
import { formatContentReport } from '../src/content/report';
import { validateContentFiles, type ContentFileInput } from '../src/content/validate';

const fixtureDirectory = path.join(process.cwd(), 'tests/fixtures/content');
const fixedNow = new Date('2026-11-04T12:00:00.000Z');

async function fixture(name: string): Promise<ContentFileInput> {
  const file = path.join(fixtureDirectory, name);
  const parsed = matter(await readFile(file, 'utf8'));
  return { file: name, data: structuredClone(parsed.data), body: parsed.content };
}

async function paired(): Promise<ContentFileInput[]> {
  return [await fixture('sample.es.md'), await fixture('sample.en.md')];
}

function document(files: ContentFileInput[], file: string) {
  return files.find((entry) => entry.file === file)?.data as Record<string, unknown>;
}

describe('content validation', () => {
  it('accepts a valid bilingual fixture pair and keeps markdown body', async () => {
    const result = validateContentFiles(await paired(), fixedNow);
    expect(result.errors).toEqual([]);
    expect(result.documents[0]?.body).toContain('Cuerpo sintético');
  });

  it('fails when honest_limit is absent and names its file and field', async () => {
    const files = await paired();
    const spanish = document(files, 'sample.es.md');
    delete spanish.honest_limit;
    const result = validateContentFiles(files, fixedNow);
    expect(result.errors).toContainEqual(expect.objectContaining({ file: 'sample.es.md', field: 'honest_limit' }));
    expect(formatContentReport(result).some((line) => line.includes('ERROR sample.es.md [honest_limit]:'))).toBe(true);
  });

  it('content:check reports a missing honest_limit from temporary synthetic fixtures', async () => {
    const files = await paired();
    delete document(files, 'sample.es.md').honest_limit;
    const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'portfolio-content-fixture-'));
    try {
      for (const entry of files) {
        await writeFile(path.join(temporaryDirectory, entry.file), matter.stringify(entry.body ?? '', entry.data as Record<string, unknown>));
      }
      const result = await checkContentDirectory(temporaryDirectory);
      expect(result.exitCode).toBe(1);
      expect(result.lines.some((line) => line.includes('ERROR sample.es.md [honest_limit]:'))).toBe(true);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it('fails when a metric source is absent', async () => {
    const files = await paired();
    const metrics = document(files, 'sample.es.md').metrics as Array<Record<string, unknown>>;
    delete metrics[0]?.source;
    expect(validateContentFiles(files, fixedNow).errors).toContainEqual(expect.objectContaining({ field: 'metrics.0.source' }));
  });

  it('fails when a metric as_of is absent', async () => {
    const files = await paired();
    const metrics = document(files, 'sample.es.md').metrics as Array<Record<string, unknown>>;
    delete metrics[0]?.as_of;
    expect(validateContentFiles(files, fixedNow).errors).toContainEqual(expect.objectContaining({ field: 'metrics.0.as_of' }));
  });

  it('fails for invalid and future as_of values', async () => {
    const files = await paired();
    const metrics = document(files, 'sample.es.md').metrics as Array<Record<string, unknown>>;
    metrics[0]!.as_of = '2026-02-30';
    expect(validateContentFiles(files, fixedNow).errors).toContainEqual(expect.objectContaining({ field: 'metrics.0.as_of' }));
    metrics[0]!.as_of = '2099-01-01';
    expect(validateContentFiles(files, fixedNow).errors).toContainEqual(expect.objectContaining({ field: 'metrics.0.as_of', message: 'cannot be in the future' }));
  });

  it('fails for a duplicate slug in the same language', async () => {
    const files = await paired();
    files.push({ file: 'duplicate.es.md', data: structuredClone(document(files, 'sample.es.md')) });
    expect(validateContentFiles(files, fixedNow).errors).toContainEqual(expect.objectContaining({ file: 'duplicate.es.md', field: 'slug' }));
  });

  it('fails for duplicate metric ids within one project document', async () => {
    const files = await paired();
    const metrics = document(files, 'sample.es.md').metrics as Array<Record<string, unknown>>;
    metrics.push({ ...metrics[0] });
    expect(validateContentFiles(files, fixedNow).errors).toContainEqual(expect.objectContaining({ field: 'metrics.1.id' }));
  });

  it('fails when .es has no .en counterpart', async () => {
    const files = await paired();
    expect(validateContentFiles(files.slice(0, 1), fixedNow).errors).toContainEqual(expect.objectContaining({ field: 'lang', message: expect.stringContaining('missing .en') }));
  });

  it('fails when .en has no .es counterpart', async () => {
    const files = await paired();
    expect(validateContentFiles(files.slice(1), fixedNow).errors).toContainEqual(expect.objectContaining({ field: 'lang', message: expect.stringContaining('missing .es') }));
  });

  it('does not report a missing .es file when the existing .es frontmatter is invalid', async () => {
    const files = await paired();
    delete document(files, 'sample.es.md').honest_limit;
    const errors = validateContentFiles(files, fixedNow).errors;
    expect(errors).toContainEqual(expect.objectContaining({ file: 'sample.es.md', field: 'honest_limit' }));
    expect(errors).not.toContainEqual(expect.objectContaining({ field: 'lang', message: expect.stringContaining('missing .es') }));
  });

  it('fails when parity fields diverge', async () => {
    const files = await paired();
    document(files, 'sample.en.md').stack = ['JavaScript'];
    expect(validateContentFiles(files, fixedNow).errors).toContainEqual(expect.objectContaining({ file: 'sample.en.md', field: 'stack' }));
  });

  it('normalizes comma decimal separators to dots for metric parity', async () => {
    const files = await paired();
    for (const input of files) {
      const metrics = (input.data as Record<string, unknown>).metrics as Array<Record<string, unknown>>;
      metrics[0]!.value = '0,91';
    }
    expect(validateContentFiles(files, fixedNow).errors).toEqual([]);
  });

  it('warns for stale dates and measured metrics without recompute', async () => {
    const files = await paired();
    for (const input of files) {
      const metrics = (input.data as Record<string, unknown>).metrics as Array<Record<string, unknown>>;
      metrics[0]!.as_of = '2026-01-01';
      delete metrics[0]!.recompute;
    }
    const result = validateContentFiles(files, fixedNow);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'metrics.0.as_of' }),
      expect.objectContaining({ field: 'metrics.0.recompute' }),
    ]));
  });
});

describe('hero aggregates', () => {
  const projects = [
    {
      slug: 'alpha', links: { live: 'https://alpha.example' }, metrics: [
        { id: 'tests_passing', label: 'Tests', value: 12, epistemic: 'medido' as const, source: 'fixture', as_of: '2026-11-02' },
        { id: 'demo_verified', label: 'Demo', value: 1, epistemic: 'medido' as const, source: 'fixture', as_of: '2026-11-03' },
      ],
    },
    {
      slug: 'beta', links: {}, metrics: [
        { id: 'tests_passing', label: 'Tests', value: 5, epistemic: 'medido' as const, source: 'fixture', as_of: '2026-10-30' },
        { id: 'demo_verified', label: 'Demo', value: 1, epistemic: 'declarado' as const, source: 'fixture', as_of: '2026-11-03' },
      ],
    },
    {
      slug: 'gamma', links: { live: 'https://gamma.example' }, metrics: [
        { id: 'tests_passing', label: 'Tests', value: 100, epistemic: 'declarado' as const, source: 'fixture', as_of: '2026-10-01' },
      ],
    },
  ];

  it('sums only measured tests and retains project breakdown', () => {
    expect(aggregateHero(projects).testsPassing).toEqual({
      total: 17,
      byProject: [
        { slug: 'alpha', value: 12, asOf: '2026-11-02' },
        { slug: 'beta', value: 5, asOf: '2026-10-30' },
      ],
    });
  });

  it('counts projects with a live link and a measured verified-demo metric', () => {
    expect(aggregateHero(projects).demoVerified).toBe(1);
  });

  it('returns the oldest date among metrics used in the aggregates', () => {
    expect(aggregateHero(projects).oldestAsOf).toBe('2026-10-30');
  });
});
