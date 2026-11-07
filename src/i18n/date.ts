export function formatDateUTC(value: string, locale: 'es' | 'en'): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}
