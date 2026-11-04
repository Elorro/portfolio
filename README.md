# Portfolio

Work in progress. This repository contains the foundations for a bilingual
portfolio built with Next.js App Router, TypeScript, and Tailwind CSS.

## Run locally

Use the Node.js version in `.nvmrc`, then install packages and start the
development server:

```sh
npm ci
npm run dev
```

The root route `/` redirects to `/es` or `/en` based on `Accept-Language` and
falls back to English. The language pages currently display the interface
dictionary as a scaffold.

Run all local checks with:

```sh
npm run verify
```

`npm run build` requires `SITE_URL` outside `next dev`. Set it to an absolute
`http://` or `https://` origin without a trailing slash, for example:

```sh
SITE_URL=http://localhost:3000 npm run build
```

When `SITE_URL` is absent in a Vercel build, the canonical URL uses
`VERCEL_PROJECT_PRODUCTION_URL`. The system variable contains a domain without
the protocol. There is no custom public domain configured in this repository.

## Content checks

Project content belongs in `content/projects/<slug>.<lang>.md`; that directory
is intentionally empty until author-provided content is ready. Run
`npm run content:check` to validate frontmatter, bilingual parity, metric dates,
and the required honest limit. The examples under `tests/fixtures/content/` are
synthetic test fixtures and are not portfolio content.

## Dependency notes

`@tailwindcss/postcss` is required to connect Tailwind CSS 4 to Next.js through
PostCSS. `typescript-eslint` supplies ESLint's TypeScript parser and rules.
`tsx` runs the TypeScript content and site validation scripts directly.
