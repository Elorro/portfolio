import { contentSchema, type ContentDocument } from './schema';

export const STALE_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ContentFileInput {
  file: string;
  data: unknown;
  body?: string;
}

export interface ContentMessage {
  file: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  errors: ContentMessage[];
  warnings: ContentMessage[];
  documents: Array<{ file: string; document: ContentDocument; body?: string }>;
}

function asOfIsValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parityValue(value: string | number): string | number {
  return typeof value === 'string' ? value.replaceAll(',', '.') : value;
}

function parityFields(document: ContentDocument) {
  return {
    tier: document.tier,
    size: document.size,
    order: document.order,
    status: document.status,
    stack: document.stack,
    links: document.links,
  };
}

function filenameIdentity(file: string): { slug: string; lang: 'es' | 'en' } | undefined {
  const basename = file.split(/[\\/]/).at(-1);
  const match = basename?.match(/^(.+)\.(es|en)\.md$/);
  if (!match) return undefined;
  return { slug: match[1]!, lang: match[2] as 'es' | 'en' };
}

export function validateContentFiles(
  files: ContentFileInput[],
  now = new Date(),
): ValidationResult {
  const errors: ContentMessage[] = [];
  const warnings: ContentMessage[] = [];
  const documents: ValidationResult['documents'] = [];

  for (const input of files) {
    const parsed = contentSchema.safeParse(input.data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          file: input.file,
          field: issue.path.join('.') || 'frontmatter',
          message: issue.message,
        });
      }
      continue;
    }

    const document = parsed.data;
    documents.push({ file: input.file, document, body: input.body });

    for (const [index, metric] of document.metrics.entries()) {
      const field = `metrics.${index}`;
      if (!metric.source) errors.push({ file: input.file, field: `${field}.source`, message: 'is required' });
      if (!metric.as_of) {
        errors.push({ file: input.file, field: `${field}.as_of`, message: 'is required' });
      } else if (!asOfIsValidDate(metric.as_of)) {
        errors.push({ file: input.file, field: `${field}.as_of`, message: 'must be a valid ISO date (YYYY-MM-DD)' });
      } else {
        const asOf = new Date(`${metric.as_of}T00:00:00.000Z`);
        if (asOf.getTime() > Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) {
          errors.push({ file: input.file, field: `${field}.as_of`, message: 'cannot be in the future' });
        } else if (now.getTime() - asOf.getTime() > STALE_DAYS * DAY_MS) {
          warnings.push({ file: input.file, field: `${field}.as_of`, message: `is older than ${STALE_DAYS} days` });
        }
      }
      if (metric.epistemic === 'medido' && !metric.recompute) {
        warnings.push({ file: input.file, field: `${field}.recompute`, message: 'is recommended for measured metrics' });
      }
    }

    const metricIds = new Set<string>();
    for (const [index, metric] of document.metrics.entries()) {
      if (metricIds.has(metric.id)) {
        errors.push({ file: input.file, field: `metrics.${index}.id`, message: `duplicates id "${metric.id}" in this project` });
      }
      metricIds.add(metric.id);
    }
  }

  const bySlugAndLang = new Map<string, { file: string; document: ContentDocument }>();
  const bySlug = new Map<string, Array<{ file: string; document: ContentDocument }>>();
  const filesBySlug = new Map<string, Map<'es' | 'en', string>>();
  for (const input of files) {
    const identity = filenameIdentity(input.file);
    if (!identity) continue;
    const languages = filesBySlug.get(identity.slug) ?? new Map<'es' | 'en', string>();
    languages.set(identity.lang, input.file);
    filesBySlug.set(identity.slug, languages);
  }

  for (const entry of documents) {
    const key = `${entry.document.slug}.${entry.document.lang}`;
    if (bySlugAndLang.has(key)) {
      errors.push({ file: entry.file, field: 'slug', message: `duplicates slug "${entry.document.slug}" for lang ${entry.document.lang}` });
    } else {
      bySlugAndLang.set(key, entry);
    }
    bySlug.set(entry.document.slug, [...(bySlug.get(entry.document.slug) ?? []), entry]);
  }

  for (const [slug, languages] of filesBySlug) {
    const spanishFile = languages.get('es');
    const englishFile = languages.get('en');
    if (!spanishFile) errors.push({ file: englishFile!, field: 'lang', message: `missing .es file for slug "${slug}"` });
    if (!englishFile) errors.push({ file: spanishFile!, field: 'lang', message: `missing .en file for slug "${slug}"` });
  }

  for (const [slug, entries] of bySlug) {
    const spanish = entries.find((entry) => entry.document.lang === 'es');
    const english = entries.find((entry) => entry.document.lang === 'en');
    if (spanish && english) {
      const left = parityFields(spanish.document);
      const right = parityFields(english.document);
      for (const field of ['tier', 'size', 'order', 'status', 'stack', 'links'] as const) {
        if (JSON.stringify(left[field]) !== JSON.stringify(right[field])) {
          errors.push({ file: english.file, field, message: `does not match Spanish parity for slug "${slug}"` });
        }
      }

      const spanishMetrics = new Map(spanish.document.metrics.map((metric) => [metric.id, metric]));
      const englishMetrics = new Map(english.document.metrics.map((metric) => [metric.id, metric]));
      const metricIds = [...new Set([...spanishMetrics.keys(), ...englishMetrics.keys()])].sort();
      if (JSON.stringify([...spanishMetrics.keys()].sort()) !== JSON.stringify([...englishMetrics.keys()].sort())) {
        errors.push({ file: english.file, field: 'metrics.id', message: `does not match Spanish parity for slug "${slug}"` });
      }
      for (const id of metricIds) {
        const spanishMetric = spanishMetrics.get(id);
        const englishMetric = englishMetrics.get(id);
        if (!spanishMetric || !englishMetric) continue;
        for (const field of ['value', 'epistemic', 'n', 'as_of'] as const) {
          const spanishValue = field === 'value' ? parityValue(spanishMetric[field]) : (spanishMetric[field] ?? null);
          const englishValue = field === 'value' ? parityValue(englishMetric[field]) : (englishMetric[field] ?? null);
          if (JSON.stringify(spanishValue) !== JSON.stringify(englishValue)) {
            errors.push({ file: english.file, field: `metrics.${field}`, message: `does not match Spanish parity for metric "${id}"` });
          }
        }
      }
    }
  }

  return { errors, warnings, documents };
}
