---
slug: pet-pulse
tier: central
size: medium
order: 4
lang: en
title: Pet Pulse
tagline: "Full-stack pet social network: a FastAPI API on PostgreSQL and a Next.js web app with types generated from the API's OpenAPI schema."
status: deployed
stack:
  - Python
  - FastAPI
  - SQLAlchemy
  - PostgreSQL
  - Supabase
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  - OpenAPI
links:
  repo: https://github.com/Elorro/pet-pulse
  live: https://petpulseweb.vercel.app/
  api_docs: https://pet-pulse-api.vercel.app/docs
metrics:
  - id: tests_passing
    label: Tests passing (API and web, combined)
    value: 139
    epistemic: medido
    source: 'pet-pulse@1f44ec0: 84 passing, Python 3.12.16, measured on 2026-11-27; pet-pulse-web@41b8dc0: 55 passing in 10 files, Node v22.23.1, measured on 2026-11-24; sum of the two suites'
    as_of: '2026-11-24'
    recompute: 'API, en pet-pulse: .venv/bin/python -m pytest -q · web, en pet-pulse-web: pnpm test'
  - id: api_operations
    label: Operations exposed by the API (OpenAPI)
    value: 28
    epistemic: medido
    source: 'pet-pulse@1f44ec0, app.openapi(): 22 paths and 28 operations'
    as_of: '2026-11-27'
    recompute: 'en pet-pulse: .venv/bin/python -c "from app.main import app; p=app.openapi()[''paths'']; print(len(p), sum(1 for v in p.values() for k in v if k in {''get'',''put'',''post'',''delete'',''options'',''head'',''patch'',''trace''}))"'
  - id: demo_verified
    label: Live demo checked by hand
    value: 1
    epistemic: medido
    source: "author's manual check of https://petpulseweb.vercel.app/"
    as_of: '2026-11-02'
    recompute: 'open https://petpulseweb.vercel.app/ and check that it loads'
honest_limit: "Personal project under active development: the figures are a dated snapshot and change with each merge. Biometric pet recognition is outlined in the documentation but not implemented. The API's notification listing orders by created_at DESC, id DESC with no stable chronological tie-break: in PostgreSQL a tie is unlikely but possible, and a test showed it intermittently (fixed in the test, not in production). The card combines two repositories, the API and the web app, and links only the API one; the web repository (Elorro/pet-pulse-web) is cited in the metric sources."
case_study: false
---
