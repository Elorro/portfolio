import { checkContentDirectory } from '../src/content/check';

async function main() {
  const report = await checkContentDirectory(process.argv[2]);
  for (const line of report.lines) {
    if (line.startsWith('AVISO ')) console.warn(line);
    else console.error(line);
  }
  if (report.exitCode !== 0) {
    process.exitCode = report.exitCode;
  } else {
    console.log(`Contenido válido: ${report.documentCount} archivo(s).`);
  }
}

void main();
