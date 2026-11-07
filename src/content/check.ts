import { contentDirectory, loadContent } from './load';
import { formatContentReport } from './report';

export async function checkContentDirectory(directory?: string, release = process.argv.includes('--release')) {
  const result = await loadContent(directory ?? contentDirectory());
  const source = process.env.CONTENT_SOURCE ?? 'real';
  const releaseErrors: string[] = [];
  if (release) {
    if (source !== 'real') releaseErrors.push('ERROR release: CONTENT_SOURCE debe ser real');
    const { es } = await import('../i18n/dictionaries/es');
    const { en } = await import('../i18n/dictionaries/en');
    const dictionaryText = [...Object.values(es), ...Object.values(en)].flatMap((value) => Array.isArray(value) ? value : [value]);
    if (dictionaryText.some((value) => typeof value === 'string' && value.includes('[FIXTURE]'))) releaseErrors.push('ERROR release: diccionarios contienen [FIXTURE]');
    const { profile } = await import('../config/profile');
    if (JSON.stringify(profile).includes('[FIXTURE]')) releaseErrors.push('ERROR release: profile contiene [FIXTURE]');
    for (const file of ['public/cv-es.pdf', 'public/cv-en.pdf']) {
      try { await (await import('node:fs/promises')).access(file); }
      catch { releaseErrors.push(`ERROR release: falta ${file}`); }
    }
  }
  if (source === 'real' && result.documents.length === 0) {
    releaseErrors.push('ERROR content: content/projects está vacío o no existe en CONTENT_SOURCE=real');
  }
  return {
    exitCode: result.errors.length > 0 || releaseErrors.length > 0 ? 1 : 0,
    lines: [...formatContentReport(result), ...releaseErrors],
    documentCount: result.documents.length,
  };
}
