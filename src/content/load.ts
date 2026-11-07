import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { validateContentFiles, type ValidationResult } from './validate';

export async function loadContent(directory = contentDirectory()): Promise<ValidationResult> {
  let names: string[];
  try {
    names = (await readdir(directory)).filter((name) => name.endsWith('.md')).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') names = [];
    else throw error;
  }
  const files = await Promise.all(names.map(async (name) => {
    const file = path.join(directory, name);
    const source = await readFile(file, 'utf8');
    const parsed = matter(source);
    return { file: name, data: parsed.data, body: parsed.content };
  }));
  return validateContentFiles(files);
}

export function contentDirectory(source = process.env.CONTENT_SOURCE ?? 'real'): string {
  if (source === 'fixtures') return path.join(process.cwd(), 'tests/fixtures/content/showcase/projects');
  if (source !== 'real') throw new Error(`CONTENT_SOURCE debe ser "real" o "fixtures"; recibido: ${source}`);
  return path.join(process.cwd(), 'content/projects');
}
