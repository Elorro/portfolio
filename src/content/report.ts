import type { ValidationResult } from './validate';

export function formatContentReport(result: ValidationResult): string[] {
  return [
    ...result.warnings.map((item) => `AVISO ${item.file} [${item.field}]: ${item.message}`),
    ...result.errors.map((item) => `ERROR ${item.file} [${item.field}]: ${item.message}`),
  ];
}
