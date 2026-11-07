import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { validateContentFiles, type ValidationResult } from './validate';

export async function loadContentFromDirectory(directory: string): Promise<ValidationResult> {
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
