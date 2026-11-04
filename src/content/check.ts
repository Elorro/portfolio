import { loadContent } from './load';
import { formatContentReport } from './report';

export async function checkContentDirectory(directory?: string) {
  const result = await loadContent(directory);
  return {
    exitCode: result.errors.length > 0 ? 1 : 0,
    lines: formatContentReport(result),
    documentCount: result.documents.length,
  };
}
