# SPEC — Fase 2 (arquitectura) · portfolio

Estado: validada por el autor el 2026-11-03. Es la fuente de verdad de la
arquitectura. Si algo del código o del chat la contradice, avisar al autor;
no resolverlo en silencio.

## 0. Principios

1. Decir la verdad sobre su propio estado: cada dato lleva tipo
   (medido|declarado), fecha y fuente.
2. Resistir meses sin mantenimiento: sitio estático, sin servicios propios,
   degradación visible en vez de silenciosa.
3. Cierto ante cualquier empresa: no nombra un rol. Python/FastAPI es el hilo
   técnico, no el titular.
4. Nadie (humano ni IA) inventa contenido: textos, métricas y fechas los provee
   el autor. El código solo los valida y los muestra.

## 1. Stack y restricciones

- Next.js App Router (última estable al iniciar), TypeScript strict, Tailwind,
  npm con package-lock.json versionado, Node LTS fijado en .nvmrc.
- SSG puro desplegado en Vercel. PROHIBIDO output: 'export' (incompatible con el
  proxy de la sección 3).
- Sin MDX, sin CMS, sin base de datos, sin API routes.
- Fuentes con next/font: Space Grotesk (display), IBM Plex Sans (cuerpo),
  IBM Plex Mono.
- Framer Motion solo en islas de cliente. R3F queda fuera. Gráficas y contenido
  no usan JS de cliente.
- Dependencias de M1: next, react, react-dom, typescript, tailwindcss, zod,
  gray-matter, vitest, eslint y sus tipos. Cualquier otra se justifica por escrito.

## 2. Tokens de diseño (variables CSS en :root)

  --bg #0A0E12 · --surface-1 #12171D · --surface-2 #1A2129 · --border #2A333D
  --text #E4E9ED · --text-muted #9BA8B4 · --text-faint #6B7885
  --accent-1 #4EE59A · --accent-2 #52C7D9 · --accent-hot #E5578C

- --text-faint (≈4,3:1 sobre --bg) SOLO para texto grande (≥24px, o ≥18,66px en
  negrita). Todo texto pequeño usa --text-muted o --text.
- --accent-hot es puntual: nunca como único portador de significado.
- Ningún estado se comunica solo con color.

## 3. Rutas e i18n

- Idiomas: es, en. Rutas /es y /en; generateStaticParams + dynamicParams=false.
  No existe app/page.tsx: "/" lo resuelve el proxy.
- Proxy (en Next 16 se llama proxy.ts; verificar la convención de la versión
  instalada e informar cuál se usó) con matcher SOLO en "/": negocia
  Accept-Language con q-values (sin librería), elige es|en, si no hay coincidencia
  o no hay cabecera cae en en, responde 307 y añade Vary: Accept-Language.
  Todo lo demás es estático real.
- Sin cookies. El selector de idioma es un <a> normal a la ruta equivalente
  (misma ancla).
- <html lang> por ruta. hreflang es, en y x-default (x-default apunta a /en) en
  metadata y en sitemap.xml.
- La URL canónica se resuelve con una única función en `src/config/site.ts`:
  1. `SITE_URL`, si está definida, debe tener protocolo `http` o `https` y no
     terminar en `/`; si no cumple, se falla.
  2. Si no está definida, usar `https://${VERCEL_PROJECT_PRODUCTION_URL}`. Vercel
     documenta esta variable de sistema como disponible en build y runtime; su
     valor es un dominio sin protocolo, por ejemplo `my-site.com`.
  3. Solo durante `next dev`, si las anteriores no están definidas, usar
     `http://localhost:3000`.
  4. En cualquier otro caso se falla indicando `SITE_URL`.
  `metadataBase`, alternates/hreflang y sitemap usan exclusivamente esta
  función; ningún otro código lee `SITE_URL` directamente. CI y scripts de
  verificación fijan `SITE_URL=http://localhost:3000`.
- Diccionario propio: src/i18n/dictionaries/es.ts es la fuente del tipo; en.ts
  debe cumplir `satisfies` sobre ese tipo. Una clave faltante rompe typecheck.
- Fechas con Intl.DateTimeFormat y timeZone: 'UTC' (evita desajustes de
  hidratación y de zona horaria).
- v1: una página por idioma (secciones con ancla). El case study es una sección.
  Rutas dedicadas por proyecto quedan fuera de v1.

## 4. Contenido

Archivos: content/projects/<slug>.<lang>.md (frontmatter + markdown, gray-matter
+ Zod). Contenido real solo lo provee el autor. Los tests usan fixtures en
tests/fixtures/content/.

Frontmatter:
  slug (kebab) · tier central|soporte|mencion · size large|medium|small ·
  order (int) · lang es|en · title · tagline ·
  status deployed|research|prototype|academic · stack string[] ·
  links { repo?, live?, api_docs? } (solo https) · metrics Metric[] ·
  honest_limit (OBLIGATORIO, texto no vacío) · live_caveat? · assets? string[] ·
  case_study? boolean (el cuerpo markdown es el case study)

Metric:
  id (NUEVO; slug neutro, único dentro del proyecto, idéntico en es y en) ·
  label · value (number|string) · epistemic medido|declarado ·
  source (obligatoria, TODAS las métricas) · as_of (ISO YYYY-MM-DD, obligatoria,
  no futura, TODAS) · n? · recompute? (aviso si falta en una "medido")

El build FALLA (exit ≠ 0, mensaje con archivo y campo) si:
  - falta honest_limit;
  - una métrica no trae source o as_of, o as_of es inválida o futura;
  - slug duplicado, o id duplicado dentro de un proyecto;
  - existe .es sin .en o .en sin .es (bidireccional);
  - paridad: para cada slug, difieren entre idiomas tier, size, order, status,
    stack, links, o de cada métrica id, value, epistemic, n, as_of. Son prosa y
    pueden diferir: title, tagline, label, source, recompute, honest_limit,
    live_caveat y el cuerpo. Para value tipo string se compara tras normalizar
    "," a ".".
  El build AVISA (no falla) si as_of supera 180 días (constante STALE_DAYS,
  umbral arbitrario y ajustable) y si una métrica "medido" no trae recompute.

## 5. Agregados del hero (calculados en build)

Solo cuentan métricas con epistemic = medido. No existe campo "featured".
  1. tests_passing: suma de las métricas con id "tests_passing" (value numérico),
     con desglose por proyecto.
  2. demo_verified: cuenta proyectos con links.live Y una métrica id
     "demo_verified". El rótulo es "demos con enlace verificado", nunca
     "desplegadas".
  3. as_of más antiguo entre las métricas usadas en 1 y 2.
Cada cifra muestra su fecha. El desglose es un <details>/<summary> (sin JS,
accesible por teclado), no un tooltip. Funciones puras con tests.

## 6. Anti-obsolescencia

- as_of visible como texto junto a cada métrica.
- Isla de cliente <Freshness>: el HTML trae la fecha fija; tras hidratar compara
  contra Date.now() y, si supera STALE_DAYS, añade un aviso en texto. Sin JS se ve
  la fecha, que ya es honesta.
- Workflow .github/workflows/link-check.yml (cron semanal + workflow_dispatch),
  configurado en config/checks.json por entrada: tipo reachable (HTTP 200) o
  health_json (HTTP 200, campo estado == "ok", lista modelos no vacía; un cambio
  de sha256 respecto al manifiesto publicado es AVISO, no fallo; antes de
  implementarlo, comprobar que el sha256 de /health corresponde al mismo artefacto
  que el del manifiesto, y si no, descartar esa comparación). Streamlit solo admite
  reachable: un 200 no prueba que la app funcione.
- Limitación a documentar en el README: GitHub desactiva los workflows
  programados tras 60 días sin actividad en repos públicos (verificar en la
  documentación vigente). El chequeo es una señal oportunista, no una garantía.
- Cada demo viva tendrá respaldo estático (capturas + live_caveat). Es contenido (M3).

## 7. Gráficas (M4, sin JS de cliente)

- SVG generado en build con d3-scale y d3-shape (solo build). Variables CSS de
  la sección 2. <title> y <desc> en cada SVG, más una tabla alternativa.
- H(t) de hurst: huecos en el trazo donde hay NaN (.defined()), NUNCA
  interpolación. Rotular "replay 2026-06-17", marcar las 14:00 ET, y aclarar en
  el eje que bar_ts es el INICIO del minuto. El JSON debe declarar su zona
  horaria; si no lo hace, detenerse y preguntar al autor.
- Calibración de hypertension: los 10 bins uniformes de models/dt4_manifest.json.
  Prohibido exportar o derivar predicciones por fila (licencia del dataset
  desconocida).
- Etiquetas pequeñas en --text-muted.

## 8. Accesibilidad y rendimiento

- WCAG 2.2 AA como objetivo. axe automatizado cubre solo una fracción: las pruebas
  Playwright recorren es y en, móvil y escritorio, y estados por defecto, :focus-visible
  y <details> abierto.
- Skip link, landmarks, foco visible, orden de tabulación lógico.
- Gate de movimiento: <MotionConfig reducedMotion="user"> + @media
  (prefers-reduced-motion) en CSS. Sin hook propio.
- Lighthouse CI (móvil): LCP ≤ 2500 ms, CLS ≤ 0,1, performance ≥ 0,9,
  accessibility ≥ 0,95. Umbrales arbitrarios y ajustables.

## 9. CI

  ci.yml: install, lint, typecheck, vitest, content:check, build. CI define
  `SITE_URL=http://localhost:3000`. Después (M5):
Playwright + axe contra `next start`, Lighthouse CI, link-check.

## 10. Hitos

  M1 Fundaciones: scaffold, tokens, fuentes, i18n + proxy, esquema/loader/
     validación/paridad/agregados, Vitest, CI básico.
  M2 Secciones con fixtures: hero, proyectos, soporte, menciones, Sobre mí,
     Contacto/CV, selector, islas de motion.
  M3 Contenido real (lo redactan el autor y el chat; Codex solo integra): 4
     centrales (voice-agent-postop, hypertension-ml-system, hurst-terminal, Pet
     Pulse), Atelier Commerce y Nexus C2 como cards cortas, IRIS como mención.
  M4 Gráficas y case study de hypertension.
  M5 CI completo, despliegue en Vercel, README honesto.
  v1 = M1 + M2 + M3 + M5. M4 entra inmediatamente después, sujeto a la
  precondición de la sección 11.

## 11. Pendientes del autor (no bloquean M1)

  - Confirmar que el JSON de hurst contiene solo H(t) derivado (sin OHLCV) antes
    de copiarlo al repo.
  - Licencia del repo: propuesta MIT para el código y todos los derechos
    reservados para los textos; decisión pendiente.
  - Declaración de uso de IA: una línea en "Sobre mí" y en el pie del sitio.
  - Alinear los README de los repos con las cifras y fechas que el sitio cita.

## 12. Fuera de v1

  Gráfica interactiva, calentamiento de demos por ping, R3F, rutas por proyecto,
  CMS, analítica.
