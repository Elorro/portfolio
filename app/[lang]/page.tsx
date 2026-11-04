import { notFound } from 'next/navigation';
import { en } from '@/i18n/dictionaries/en';
import { es } from '@/i18n/dictionaries/es';
import { isLocale } from '@/i18n/config';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = lang === 'es' ? es : en;

  return (
    <>
      <a className="sr-only focus:not-sr-only" href="#main-content">{dictionary.skipToContent}</a>
      <main id="main-content" className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <p className="text-sm text-muted">{dictionary.workInProgress}</p>
      <h1 className="mt-3 font-display text-4xl font-bold">{dictionary.portfolio}</h1>
      <p className="mt-3 text-muted">{dictionary.workInProgress}</p>
      <dl className="mt-10 grid gap-4 sm:grid-cols-2">
        {Object.entries(dictionary).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-border bg-surface-1 p-4">
            <dt className="font-mono text-sm text-muted">{key}</dt>
            <dd className="mt-1 text-text">{value}</dd>
          </div>
        ))}
      </dl>
      </main>
    </>
  );
}
