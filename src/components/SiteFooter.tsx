import type { Dictionary } from '@/i18n/dictionaries/es';
export function SiteFooter({ dictionary }: { dictionary: Dictionary }) { return <footer className="site-footer"><p>{dictionary.aiDisclosure}</p><p>{dictionary.licenseNote}</p></footer>; }
