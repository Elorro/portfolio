import type { Dictionary } from '@/i18n/dictionaries/es';
export function About({ dictionary }: { dictionary: Dictionary }) { return <section id="about"><h2>{dictionary.about}</h2>{dictionary.aboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>; }
