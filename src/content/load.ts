import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { validateContentFiles, type ValidationResult } from './validate';

export async function loadContent(directory = path.join(process.cwd(), 'content/projects')): Promise<ValidationResult> {
  const names = (await readdir(directory)).filter((name) => name.endsWith('.md')).sort();
  const files = await Promise.all(names.map(async (name) => {
    const file = path.join(directory, name);
    const source = await readFile(file, 'utf8');
    const parsed = matter(source);
    return { file: name, data: parsed.data, body: parsed.content };
  }));
  return validateContentFiles(files);
}
