---
slug: hurst-terminal
tier: central
size: medium
order: 3
lang: en
title: Hurst Terminal
tagline: 'Personal market-regime terminal: rolling Hurst exponent (DFA) and fractal dimension over Nasdaq stocks, as a regime diagnostic, not a trading signal.'
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
    label: FOMC sessions with the minimum H inside the announcement window (the first 2 predate the hypothesis registration)
    value: '2/3'
    epistemic: declarado
    n: 3
    as_of: '2026-09-16'
    source: 'hurst-terminal@7d64f6e, docs/BITACORA.md §11–§13: June (replay) and July (live) with the minimum at 14:00 ET; September with the minimum at 11:42 ET, 138 min before the announcement; hypothesis registered on 2026-09-04'
  - id: june_min_h
    label: Minimum H of the 2026-06-17 FOMC session (replay, NVDA, 1-min bars, 120-bar window), at 14:00 ET
    value: 0.350462
    epistemic: medido
    n: 270
    as_of: '2026-11-21'
    source: 'hurst-terminal@7d64f6e, portfolio-assets/fomc-2026-06-17-nvda-hurst.json (series key); 390 bars, 120 with null H (incomplete window or segment break) and 270 with H; the time is the start of the minute, in ET (UTC−4, EDT)'
    recompute: >-
      python3 -c "import json,math; s=json.load(open('portfolio-assets/fomc-2026-06-17-nvda-hurst.json'))['series']; v=[x for x in s if x['H'] is not None and not math.isnan(x['H'])]; m=min(v,key=lambda x:x['H']); print(len(s),len(v),m['bar_ts'],m['H'])"
  - id: live_replay_window_match
    label: Bars identical between the live capture and the replay in the announcement window (FOMC of 2026-07-29)
    value: '36/36'
    epistemic: declarado
    n: 36
    as_of: '2026-07-29'
    source: 'hurst-terminal@7d64f6e, docs/BITACORA.md (2026-07-29 session); 13:45–14:20 ET window; the live-capture CSV is not in the repository'
honest_limit: 'Single-user research instrument: not a deployed service, not a source of trading signals, and not investment advice. The evidence is 3 FOMC sessions (June in replay, July live, and September), which is an anecdote, not a pattern. The primary hypothesis (the global minimum of H falls within 5 minutes after the announcement) was registered on 2026-09-04, after the June and July sessions: those two match, but they helped shape it; the only session observed under the protocol, September, did not meet it (minimum at 11:42 ET, 138 minutes before the announcement) and is kept in the record. The October 28 capture was not achieved. The July figures are declared: the live-capture CSV is not in the repository. The DFA estimator was validated only on synthetic series, which recover the ordering and separation of three regimes but not absolute magnitudes. The pipeline runs only on NVDA, with 1-minute bars and a 120-bar window, parameters fixed before each verification; AMD was scoped out because the free IEX feed lacks the coverage resolution it needs, and a DNS drop in July cost 3 minutes of unrecoverable data. There is no UI, backtester or order routing.'
case_study: false
---
