---
slug: voice-agent-postop
tier: central
size: large
order: 1
lang: es
title: Voice Agent Post-Op
tagline: 'Agente de voz en español para el seguimiento postoperatorio: transcribe, extrae señales clínicas, decide con una política determinista y responde preguntas desde un corpus clínico, dejando la fuente citada en el registro.'
status: prototype
stack:
  - Python
  - FastAPI
  - Docker
  - ChromaDB
  - ONNX Runtime
  - Piper
  - Whisper
  - Gemini API
  - Ollama
links:
  repo: https://github.com/Elorro/voice-agent-postop
  video: 'https://drive.google.com/file/d/1gNb__OcH8fZ4wjcE38KhpXCLEBS_L-P_/view?usp=sharing'
metrics:
  - id: tests_passing
    label: Pruebas aprobadas (suite completa)
    value: 379
    epistemic: medido
    source: 'voice-agent-postop@291587e; venv limpio, con el dataset presente'
    as_of: '2026-11-15'
    recompute: 'DATASET_DIR=./dataset python3 -m pytest tests/ -q'
  - id: policy_recall_red
    label: Recall de banderas rojas (dev set sintético, in-sample)
    value: '12/12'
    epistemic: medido
    source: 'voice-agent-postop@291587e, scripts/verificacion_hd1.py (V1); 12 casos rojos de 6 pacientes; IC de Wilson por paciente [0,61 · 1,0]'
    n: 12
    as_of: '2026-11-18'
    recompute: 'DATASET_DIR=./dataset python3 scripts/verificacion_hd1.py'
  - id: policy_overescalation
    label: Sobre-escalamiento verde→amarillo (dev set sintético)
    value: '11/123'
    epistemic: medido
    source: 'voice-agent-postop@291587e, scripts/verificacion_hd1.py (V1); 123 casos reales verdes de 160 (112 correctos y 11 escalados a amarillo): 4 tempranos y 7 tardíos'
    n: 123
    as_of: '2026-11-18'
    recompute: 'DATASET_DIR=./dataset python3 scripts/verificacion_hd1.py'
  - id: latency_p50_ms
    label: Latencia P50, fin de habla → audio (ms, navegador)
    value: 4827
    epistemic: declarado
    source: 'README §9.2.1 de voice-agent-postop; sale de turnos.jsonl (no versionado); 5 llamadas por navegador, una máquina y red; P95 8426 ms'
    n: 16
    as_of: '2026-08-10'
  - id: injection_resisted
    label: Ataques de inyección de prompt resistidos
    value: '4/4'
    epistemic: declarado
    source: 'docs/prueba_inyeccion.md de voice-agent-postop; 2 llamadas por navegador con gemini-3.5-flash-lite; registro en turnos.jsonl (no versionado)'
    n: 4
    as_of: '2026-08-10'
honest_limit: 'Prototipo hecho para el Tech Sphere Challenge 2026, con datos sintéticos; no es un dispositivo médico ni está validado clínicamente. El recall de 12/12 es sobre un dev set sintético de 160 casos, con 12 casos rojos de 6 pacientes, y varios umbrales de la política (fiebre, dolor, constitucional y los de conteo) se eligieron sobre ese mismo conjunto: no es una estimación fuera de muestra. El intervalo de Wilson a nivel de paciente es [0,61 · 1,0]. Estas cifras miden la política con las señales ya entregadas, no al agente completo con el LLM extrayendo señales de un habla evasiva, que no se ha medido. La latencia sale de 5 llamadas por navegador en una sola máquina y red (el P95 es el segundo peor valor de 16) y sus logs no viajan en el repositorio. La prueba de inyección de prompt fueron 4 ataques en 2 llamadas con un solo modelo: no es una evaluación sistemática ni cubre documentos subidos, otros idiomas ni ofuscación. La voz es es_MX de Piper, ni colombiana ni validada con pacientes, y el agente no admite interrupciones (barge-in). La recuperación usa un embedder monolingüe en inglés: con la configuración entregada acepta 6 de 10 consultas cubiertas y declara no tener el dato en las otras 4. El STT y el LLM son servicios externos con cuota: reproducir la demo con voz exige claves propias de Groq y Google, o el modo local, con una latencia mucho mayor.'
case_study: false
---
