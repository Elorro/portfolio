import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { getSiteUrl } from '@/config/site';
import { isLocale, locales, type Locale } from '@/i18n/config';
import '@/styles/globals.css';
import { MotionProvider } from '@/components/client/MotionProvider';
import { FixtureBanner } from '@/components/FixtureBanner';
import { es } from '@/i18n/dictionaries/es';
import { en } from '@/i18n/dictionaries/en';

const displayFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const bodyFont = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-ibm-plex-sans' });
const monoFont = IBM_Plex_Mono({ subsets: ['latin'], weight: '400', variable: '--font-ibm-plex-mono' });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const siteUrl = getSiteUrl();

  return {
    metadataBase: siteUrl,
    title: 'Portfolio',
    alternates: {
      canonical: `/${lang}`,
      languages: { es: '/es', en: '/en', 'x-default': '/en' },
    },
    robots: process.env.CONTENT_SOURCE === 'fixtures' ? { index: false, follow: false } : undefined,
  };
}

export default async function LanguageLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const siteUrl = getSiteUrl().origin;

  return (
    <html lang={lang as Locale}>
      <head dangerouslySetInnerHTML={{ __html: `<link rel="alternate" hreflang="es" href="${siteUrl}/es"><link rel="alternate" hreflang="en" href="${siteUrl}/en"><link rel="alternate" hreflang="x-default" href="${siteUrl}/en">` }} />
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
        {process.env.CONTENT_SOURCE === 'fixtures' ? <FixtureBanner dictionary={lang === 'es' ? es : en} /> : null}
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
