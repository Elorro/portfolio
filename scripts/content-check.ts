import { checkContentDirectory } from '../src/content/check';

async function main() {
  const directory = process.argv[2] === '--release' ? undefined : process.argv[2];
  const report = await checkContentDirectory(directory);
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
