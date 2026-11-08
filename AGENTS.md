# Reglas de trabajo para agentes (Codex u otros)

Fuente de verdad de la arquitectura: docs/SPEC_FASE2.md. Léela completa antes de
escribir código. Si algo es ambiguo, o contradice la versión instalada de una
dependencia, DETENTE y pregunta; no lo resuelvas en silencio.

## Contenido
- No inventes contenido, métricas, fechas ni enlaces. Los textos y cifras los provee
  el autor. Los tests usan fixtures sintéticos en tests/fixtures/.
- content/projects/ solo contiene contenido real aprobado por el autor.

## Git
- Una rama por hito, creada desde main. Commits pequeños y atómicos.
- Nunca `git add .` ni `git add -A`: rutas explícitas.
- docs/BRIEF.md está ignorado a propósito y no debe subirse jamás.
- No publiques ramas ni abras PR a menos que tengas credenciales válidas; si no las
  tienes, dilo y detente.

## Dependencias y stack
- Solo las dependencias de la spec §1. Justifica por escrito cualquier otra.
- `src/components/client/**` no importa `zod`, `gray-matter`, `node:*` ni `src/content/{validate,load,check}` (ESLint `no-restricted-imports`).
- Prohibido output: 'export'. Sin MDX, CMS, base de datos ni API routes.

## Verificación
- Node 26.x (.nvmrc). Si nvm no está, usa `npx --yes --package=node@26.13.0 --call '...'`.
- `npm run verify` debe salir con 0 antes de dar un hito por terminado.
- Cada criterio de aceptación se demuestra con salida literal de comandos, no con
  afirmaciones. Una respuesta 200 no prueba que un proxy no se ejecute.

## Reporte final (siempre)
Rama, commits, versiones instaladas, desviaciones de la spec, decisiones tomadas que
la spec no escribía, dependencias añadidas, y la salida de los comandos de verificación.
