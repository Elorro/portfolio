import { z } from 'zod';

const httpsLink = z.url().refine((value) => new URL(value).protocol === 'https:', {
  message: 'must use https',
});

export const metricSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/),
  label: z.string().trim().min(1),
  value: z.union([z.number().finite(), z.string().trim().min(1)]),
  epistemic: z.enum(['medido', 'declarado']),
  source: z.string().trim().min(1).optional(),
  as_of: z.string().optional(),
  n: z.number().finite().nonnegative().optional(),
  recompute: z.string().trim().min(1).optional(),
});

export const contentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  tier: z.enum(['central', 'soporte', 'mencion']),
  size: z.enum(['large', 'medium', 'small']),
  order: z.number().int(),
  lang: z.enum(['es', 'en']),
  title: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  status: z.enum(['deployed', 'research', 'prototype', 'academic']),
  stack: z.array(z.string().trim().min(1)),
  links: z.object({ repo: httpsLink.optional(), live: httpsLink.optional(), api_docs: httpsLink.optional() }),
  metrics: z.array(metricSchema),
  honest_limit: z.string().trim().min(1),
  live_caveat: z.string().trim().min(1).optional(),
  assets: z.array(z.string()).optional(),
  case_study: z.boolean().optional(),
});

export type Metric = z.infer<typeof metricSchema>;
export type ContentDocument = z.infer<typeof contentSchema>;
