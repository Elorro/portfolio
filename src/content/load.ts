import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { validateContentFiles, type ValidationResult } from './validate';

async function loadRealContent(): Promise<ValidationResult> {
  const directory = path.join(process.cwd(), 'content/projects');
  let names: string[];
  try {
    names = (await readdir(path.join(process.cwd(), 'content/projects'))).filter((name) => name.endsWith('.md')).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') names = [];
    else throw error;
  }
  const files = await Promise.all(names.map(async (name) => {
    const source = await readFile(`${directory}/${name}`, 'utf8');
    const parsed = matter(source);
    return { file: name, data: parsed.data, body: parsed.content };
  }));
  return validateContentFiles(files);
}

async function loadShowcaseFixtures(): Promise<ValidationResult> {
  const directory = path.join(process.cwd(), 'tests/fixtures/content/showcase/projects');
  let names: string[];
  try {
    names = (await readdir(path.join(process.cwd(), 'tests/fixtures/content/showcase/projects')))
      .filter((name) => name.endsWith('.md'))
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') names = [];
    else throw error;
  }
  const files = await Promise.all(names.map(async (name) => {
    const source = await readFile(`${directory}/${name}`, 'utf8');
    const parsed = matter(source);
    return { file: name, data: parsed.data, body: parsed.content };
  }));
  return validateContentFiles(files);
}

export async function loadContent(): Promise<ValidationResult> {
  const source = process.env.CONTENT_SOURCE ?? 'real';
  if (source === 'real') return loadRealContent();
  if (source === 'fixtures') return loadShowcaseFixtures();
  throw new Error(`CONTENT_SOURCE debe ser "real" o "fixtures"; recibido: ${source}`);
}
