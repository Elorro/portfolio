import Link from 'next/link';
import { en } from '@/i18n/dictionaries/en';
import { es } from '@/i18n/dictionaries/es';

export default async function NotFound({
  params,
}: {
  params?: Promise<{ lang: string }>;
}) {
  const { lang = 'en' } = (await params) ?? {};
  const dictionary = lang === 'es' ? es : en;

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-3xl font-bold">{dictionary.pageNotFound}</h1>
      <Link className="mt-6 inline-block underline" href={`/${lang}`}>
        {dictionary.returnHome}
      </Link>
    </main>
  );
}
