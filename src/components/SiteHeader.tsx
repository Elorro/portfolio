import type { Dictionary } from '@/i18n/dictionaries/es';
import { LanguageLink } from './client/LanguageLink';

export function SiteHeader({ lang, dictionary, sections }: { lang: 'es' | 'en'; dictionary: Dictionary; sections: string[] }) {
  const ids: Record<string, string> = { projects: dictionary.projects, 'case-study': dictionary.caseStudy, support: dictionary.supportingProjects, mentions: dictionary.mentions, about: dictionary.about, contact: dictionary.contact };
  const other = lang === 'es' ? 'en' : 'es';
  return <><a className="skip-link" href="#main-content">{dictionary.skipToContent}</a><header className="site-header"><a href={`/${lang}`} className="brand">{dictionary.home}</a><nav aria-label={dictionary.navigation}><ul>{sections.map((id) => <li key={id}><a href={`#${id}`}>{ids[id]}</a></li>)}</ul></nav><LanguageLink base={`/${other}`} lang={other} label={dictionary.languageSwitch} /></header></>;
}
