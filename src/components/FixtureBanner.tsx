import type { Dictionary } from '@/i18n/dictionaries/es';
export function FixtureBanner({ dictionary }: { dictionary: Dictionary }) { return <aside className="fixture-banner" role="note">{dictionary.fixtureBanner}</aside>; }
