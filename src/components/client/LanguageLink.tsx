'use client';

import { useEffect, useState } from 'react';

export function languageHref(base: string, hash: string): string {
  return `${base}${/^#[a-z0-9-]+$/.test(hash) ? hash : ''}`;
}

export function LanguageLink({ base, lang, label }: { base: string; lang: 'es' | 'en'; label: string }) {
  const [href, setHref] = useState(base);
  useEffect(() => {
    const update = () => setHref(languageHref(base, window.location.hash));
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [base]);
  return <a href={href} lang={lang} hrefLang={lang}>{label}</a>;
}
