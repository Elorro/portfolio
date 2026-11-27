---
slug: pet-pulse
tier: central
size: medium
order: 4
lang: es
title: Pet Pulse
tagline: "Red social de mascotas full-stack: API FastAPI sobre PostgreSQL y web Next.js con tipos generados desde el esquema OpenAPI de la API."
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
    label: Pruebas aprobadas (API y web, suma)
    value: 139
    epistemic: medido
    source: "pet-pulse@1f44ec0: 84 aprobadas, Python 3.12.16, medido el 2026-11-27; pet-pulse-web@41b8dc0: 55 aprobadas en 10 archivos, Node v22.23.1, medido el 2026-11-24; suma de las dos suites"
    as_of: '2026-11-24'
    recompute: 'API, en pet-pulse: .venv/bin/python -m pytest -q · web, en pet-pulse-web: pnpm test'
  - id: api_operations
    label: Operaciones que expone la API (OpenAPI)
    value: 28
    epistemic: medido
    source: 'pet-pulse@1f44ec0, app.openapi(): 22 paths y 28 operaciones'
    as_of: '2026-11-27'
    recompute: 'en pet-pulse: .venv/bin/python -c "from app.main import app; p=app.openapi()[''paths'']; print(len(p), sum(1 for v in p.values() for k in v if k in {''get'',''put'',''post'',''delete'',''options'',''head'',''patch'',''trace''}))"'
  - id: demo_verified
    label: Demo en vivo verificada a mano
    value: 1
    epistemic: medido
    source: 'prueba manual del autor sobre https://petpulseweb.vercel.app/'
    as_of: '2026-11-02'
    recompute: 'abrir https://petpulseweb.vercel.app/ y comprobar que carga'
honest_limit: "Proyecto personal en desarrollo activo: las cifras son una foto fechada y cambian con cada merge. El reconocimiento biométrico de mascotas está planteado en la documentación pero no está implementado. El listado de notificaciones de la API ordena por created_at DESC, id DESC sin un desempate cronológico estable: en PostgreSQL un empate es improbable pero posible, y un test lo mostró de forma intermitente (se corrigió en el test, no en producción). La ficha reúne dos repositorios, la API y la web, y solo enlaza el de la API; el de la web (Elorro/pet-pulse-web) se cita en las fuentes de las métricas."
case_study: false
---
