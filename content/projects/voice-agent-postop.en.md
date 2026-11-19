---
slug: voice-agent-postop
tier: central
size: large
order: 1
lang: en
title: Voice Agent Post-Op
tagline: 'Spanish-language voice agent for post-operative follow-up: it transcribes, extracts clinical signals, decides with a deterministic policy, and answers questions from a clinical corpus, logging the cited source.'
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
    label: Tests passing (full suite)
    value: 379
    epistemic: medido
    source: 'voice-agent-postop@291587e; clean venv, dataset present'
    as_of: '2026-11-15'
    recompute: 'DATASET_DIR=./dataset python3 -m pytest tests/ -q'
  - id: policy_recall_red
    label: Red-flag recall (synthetic dev set, in-sample)
    value: '12/12'
    epistemic: medido
    source: 'voice-agent-postop@291587e, scripts/verificacion_hd1.py (V1); 12 red cases from 6 patients; patient-level Wilson interval [0.61 · 1.0]'
    n: 12
    as_of: '2026-11-18'
    recompute: 'DATASET_DIR=./dataset python3 scripts/verificacion_hd1.py'
  - id: policy_overescalation
    label: Green→yellow over-escalation (synthetic dev set)
    value: '11/123'
    epistemic: medido
    source: 'voice-agent-postop@291587e, scripts/verificacion_hd1.py (V1); 123 real-green cases out of 160 (112 correct and 11 escalated to yellow): 4 early and 7 late'
    n: 123
    as_of: '2026-11-18'
    recompute: 'DATASET_DIR=./dataset python3 scripts/verificacion_hd1.py'
  - id: latency_p50_ms
    label: P50 latency, end of speech → audio (ms, browser)
    value: 4827
    epistemic: declarado
    source: 'voice-agent-postop README §9.2.1; from turnos.jsonl (not versioned); 5 browser calls, one machine and network; P95 8426 ms'
    n: 16
    as_of: '2026-08-10'
  - id: injection_resisted
    label: Prompt-injection attacks resisted
    value: '4/4'
    epistemic: declarado
    source: 'voice-agent-postop docs/prueba_inyeccion.md; 2 browser calls with gemini-3.5-flash-lite; log in turnos.jsonl (not versioned)'
    n: 4
    as_of: '2026-08-10'
honest_limit: 'Prototype built for the Tech Sphere Challenge 2026, on synthetic data; not a medical device and not clinically validated. The 12/12 recall is on a synthetic 160-case dev set with 12 red cases from 6 patients, and several policy thresholds (fever, pain, constitutional symptoms and the count-based ones) were chosen on that same set: it is not an out-of-sample estimate. The patient-level Wilson interval is [0.61 · 1.0]. These figures measure the policy given already-extracted signals, not the full agent with the LLM extracting signals from evasive speech, which has not been measured. Latency comes from 5 browser calls on a single machine and network (P95 is the second-worst of 16 values) and its logs are not in the repository. The prompt-injection test was 4 attacks in 2 calls against a single model: not a systematic evaluation, and it does not cover uploaded documents, other languages or obfuscation. The voice is Piper es_MX, neither Colombian nor validated with patients, and the agent does not support interruptions (barge-in). Retrieval uses an English-only embedder: with the shipped configuration it accepts 6 of 10 covered queries and says it lacks the data on the other 4. STT and LLM are external, quota-limited services: reproducing the demo with voice requires your own Groq and Google keys, or local mode, with much higher latency.'
case_study: false
---
