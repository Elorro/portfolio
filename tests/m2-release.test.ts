import { afterEach, describe, expect, it } from 'vitest';
import { checkContentDirectory } from '../src/content/check';

const previous = process.env.CONTENT_SOURCE;
afterEach(() => { if (previous === undefined) delete process.env.CONTENT_SOURCE; else process.env.CONTENT_SOURCE = previous; });

describe('release content gate', () => {
  it('rejects fixtures, [FIXTURE] author strings, and missing configured CVs', async () => {
    process.env.CONTENT_SOURCE = 'fixtures';
    const report = await checkContentDirectory(undefined, true);
    expect(report.exitCode).not.toBe(0);
    expect(report.lines.join('\n')).toContain('CONTENT_SOURCE debe ser real');
    expect(report.lines.join('\n')).toContain('diccionarios contienen [FIXTURE]');
    expect(report.lines.join('\n')).toContain('falta public/cv-es.pdf');
    expect(report.lines.join('\n')).toContain('falta public/cv-en.pdf');
  });
});
