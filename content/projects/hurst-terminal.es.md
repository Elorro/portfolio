---
slug: hurst-terminal
tier: central
size: medium
order: 3
lang: es
title: Hurst Terminal
tagline: 'Terminal personal de régimen de mercado: exponente de Hurst móvil (DFA) y dimensión fractal sobre acciones del Nasdaq, como diagnóstico de régimen y no como señal de trading.'
status: research
stack:
  - Python
  - NumPy
  - pandas
  - asyncio
  - alpaca-py
links:
  repo: https://github.com/Elorro/hurst-terminal
metrics:
  - id: fomc_sessions_primary
    label: Sesiones FOMC con el mínimo de H en la ventana del anuncio (las 2 primeras anteceden al registro de la hipótesis)
    value: '2/3'
    epistemic: declarado
    n: 3
    as_of: '2026-09-16'
    source: 'hurst-terminal@7d64f6e, docs/BITACORA.md §11–§13: junio (replay) y julio (en vivo) con el mínimo a las 14:00 ET; septiembre con el mínimo a las 11:42 ET, 138 min antes del anuncio; hipótesis registrada el 2026-09-04'
  - id: june_min_h
    label: H mínimo de la sesión FOMC del 2026-06-17 (replay, NVDA, barras de 1 min, ventana de 120), a las 14:00 ET
    value: 0.350462
    epistemic: medido
    n: 270
    as_of: '2026-11-21'
    source: 'hurst-terminal@7d64f6e, portfolio-assets/fomc-2026-06-17-nvda-hurst.json (clave series); 390 barras, 120 con H nulo (ventana incompleta o corte de segmento) y 270 con H; la hora es el inicio del minuto, en ET (UTC−4, EDT)'
    recompute: >-
      python3 -c "import json,math; s=json.load(open('portfolio-assets/fomc-2026-06-17-nvda-hurst.json'))['series']; v=[x for x in s if x['H'] is not None and not math.isnan(x['H'])]; m=min(v,key=lambda x:x['H']); print(len(s),len(v),m['bar_ts'],m['H'])"
  - id: live_replay_window_match
    label: Barras idénticas entre la captura en vivo y el replay en la ventana del anuncio (FOMC del 2026-07-29)
    value: '36/36'
    epistemic: declarado
    n: 36
    as_of: '2026-07-29'
    source: 'hurst-terminal@7d64f6e, docs/BITACORA.md (sesión del 2026-07-29); ventana de 13:45 a 14:20 ET; el CSV de la captura en vivo no está en el repositorio'
honest_limit: 'Instrumento de investigación de un solo usuario: no es un servicio desplegado, ni una fuente de señales de trading, ni asesoría de inversión. La evidencia son 3 sesiones FOMC (junio en replay, julio en vivo y septiembre), lo que es una anécdota y no un patrón. La hipótesis primaria (el mínimo global de H cae dentro de los 5 minutos posteriores al anuncio) se registró el 2026-09-04, después de las sesiones de junio y julio: esas dos coinciden, pero ayudaron a formularla; la única sesión observada bajo el protocolo, la de septiembre, no la cumplió (mínimo a las 11:42 ET, 138 minutos antes del anuncio) y se conserva en el registro. La captura del 28 de octubre no se logró. Las cifras de julio son declaradas: el CSV de la captura en vivo no está en el repositorio. El estimador DFA se validó solo con series sintéticas, que recuperan el orden y la separación de tres regímenes pero no magnitudes absolutas. El pipeline corre solo sobre NVDA, con barras de 1 minuto y ventana de 120 barras, parámetros fijados antes de cada verificación; AMD se descartó porque el feed gratuito IEX no tiene la resolución de cobertura necesaria, y una caída de DNS en julio costó 3 minutos de datos irrecuperables. No hay interfaz, backtester ni enrutamiento de órdenes.'
case_study: false
---
