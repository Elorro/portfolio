import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from '../src/config/site';
import { negotiate } from '../src/i18n/negotiate';
import { config as proxyConfig } from '../proxy';

describe('resolveSiteUrl', () => {
  it('uses SITE_URL when defined', () => {
    expect(resolveSiteUrl({ SITE_URL: 'http://example.test' }, false).toString()).toBe('http://example.test/');
  });

  it('uses the production Vercel domain with https', () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'portfolio.example' }, false).toString()).toBe('https://portfolio.example/');
  });

  it('uses localhost only in development', () => {
    expect(resolveSiteUrl({}, true).toString()).toBe('http://localhost:3000/');
  });

  it('fails outside development when no URL is configured', () => {
    expect(() => resolveSiteUrl({}, false)).toThrow(/SITE_URL/);
  });

  it('rejects malformed SITE_URL rather than falling back', () => {
    expect(() => resolveSiteUrl({ SITE_URL: 'https://example.test/' }, true)).toThrow(/SITE_URL/);
  });
});

describe('negotiate', () => {
  it('respects q-values', () => {
    expect(negotiate('en;q=0.4, es;q=0.9')).toBe('es');
  });

  it('matches a regional Spanish tag', () => {
    expect(negotiate('es-CO,es;q=0.9,en;q=0.5')).toBe('es');
  });

  it('falls back to English for unsupported languages', () => {
    expect(negotiate('fr-FR,fr;q=0.9')).toBe('en');
  });

  it('falls back to English when the header is absent', () => {
    expect(negotiate(null)).toBe('en');
  });
});

describe('proxy matcher', () => {
  it('is configured for the root route only', () => {
    expect(proxyConfig.matcher).toBe('/');
  });
});
