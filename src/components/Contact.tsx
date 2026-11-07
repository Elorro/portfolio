import type { Dictionary } from '@/i18n/dictionaries/es';
import { profile } from '@/config/profile';
export function Contact({ dictionary, lang }: { dictionary: Dictionary; lang: 'es' | 'en' }) {
  const cv = profile.cv[lang];
  return <section id="contact"><h2>{dictionary.contact}</h2><p>{dictionary.contactNote}</p><ul><li><a href={`mailto:${profile.email}`}>{dictionary.email}</a></li><li><a href={profile.github} rel="noopener noreferrer">GitHub</a></li><li><a href={profile.linkedin} rel="noopener noreferrer">LinkedIn</a></li><li>{cv ? <a href={cv}>{dictionary.curriculum}</a> : <span>{dictionary.fixtureCvPending}</span>}</li></ul></section>;
}
