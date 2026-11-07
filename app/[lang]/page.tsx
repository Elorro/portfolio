import { notFound } from 'next/navigation';
import { en } from '@/i18n/dictionaries/en';
import { es } from '@/i18n/dictionaries/es';
import { isLocale } from '@/i18n/config';
import { loadContent } from '@/content/load';
import { Hero } from '@/components/Hero';
import { ProjectCard } from '@/components/ProjectCard';
import { SupportCard } from '@/components/SupportCard';
import { MentionRow } from '@/components/MentionRow';
import { CaseStudy } from '@/components/CaseStudy';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = lang === 'es' ? es : en;
  const result = await loadContent();
  if (result.errors.length) throw new Error(`Contenido inválido: ${result.errors.map((entry) => `${entry.file} [${entry.field}] ${entry.message}`).join('; ')}`);
  if ((process.env.CONTENT_SOURCE ?? 'real') === 'real' && !result.documents.length) throw new Error('CONTENT_SOURCE=real requiere contenido aprobado en content/projects; el directorio está vacío o no existe.');
  const documents = result.documents.slice().sort((a, b) => a.document.order - b.document.order || a.document.slug.localeCompare(b.document.slug));
  const central = documents.filter(({ document }) => document.tier === 'central');
  const support = documents.filter(({ document }) => document.tier === 'soporte');
  const mentions = documents.filter(({ document }) => document.tier === 'mencion');
  const sections = [central.length ? 'projects' : '', documents.some(({ document, body }) => document.case_study && body) ? 'case-study' : '', support.length ? 'support' : '', mentions.length ? 'mentions' : '', 'about', 'contact'].filter(Boolean);
  const declarations = documents.flatMap(({ document }) => document.metrics).filter((metric) => metric.epistemic === 'declarado');
  return (
    <>
      <SiteHeader lang={lang} dictionary={dictionary} sections={sections} />
      <main id="main-content" className="site-main">
        <Hero documents={result.documents} dictionary={dictionary} lang={lang} />
        {central.length ? <section id="projects"><h2>{dictionary.centralProjects}</h2><div className="central-grid">{central.map(({ document, body }) => <ProjectCard key={document.slug} item={document} body={body} dictionary={dictionary} lang={lang} variant={document.size === 'large' ? 'large' : document.size === 'medium' ? 'medium' : 'small'} />)}</div><div className="epistemic-legend"><details><summary>{dictionary.measured}</summary><p>{dictionary.measuredLegend}</p></details><details><summary>{dictionary.declared}</summary><p>{dictionary.declaredLegend}</p></details></div><div className="declared-metrics">{declarations.map((metric, index) => <p key={`${metric.id}-${index}`}>{metric.label}: {metric.value} <span className="epistemic epistemic-declarado">{dictionary.declared}</span></p>)}</div></section> : null}
        <CaseStudy documents={result.documents} dictionary={dictionary} />
        {support.length ? <section id="support"><h2>{dictionary.supportingProjects}</h2><div className="support-grid">{support.map(({ document, body }) => <SupportCard key={document.slug} item={document} body={body} dictionary={dictionary} lang={lang} />)}</div></section> : null}
        {mentions.length ? <section id="mentions"><h2>{dictionary.mentions}</h2><div className="mention-list">{mentions.map(({ document }) => <MentionRow key={document.slug} item={document} dictionary={dictionary} />)}</div></section> : null}
        <About dictionary={dictionary} />
        <Contact dictionary={dictionary} lang={lang} />
      </main>
      <SiteFooter dictionary={dictionary} />
    </>
  );
}
