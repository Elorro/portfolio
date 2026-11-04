export interface SiteUrlEnvironment {
  SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}

export function resolveSiteUrl(
  environment: SiteUrlEnvironment,
  isNextDev: boolean,
): URL {
  if (environment.SITE_URL !== undefined) {
    const value = environment.SITE_URL;
    if (!/^https?:\/\/[^/]+$/i.test(value)) {
      throw new Error('SITE_URL must use http:// or https:// and must not end with a slash.');
    }
    try {
      return new URL(value);
    } catch {
      throw new Error('SITE_URL must be a valid absolute http(s) URL without a trailing slash.');
    }
  }

  const productionDomain = environment.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionDomain) {
    try {
      const url = new URL(`https://${productionDomain}`);
      if (url.hostname !== productionDomain || url.pathname !== '/') {
        throw new Error();
      }
      return url;
    } catch {
      throw new Error('VERCEL_PROJECT_PRODUCTION_URL must contain only a domain name.');
    }
  }

  if (isNextDev) return new URL('http://localhost:3000');

  throw new Error('SITE_URL is required when building outside Vercel.');
}

export function getSiteUrl(): URL {
  return resolveSiteUrl({
    SITE_URL: process.env.SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  }, process.env.NODE_ENV === 'development');
}
