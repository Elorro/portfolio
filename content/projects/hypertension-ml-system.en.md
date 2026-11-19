---
slug: hypertension-ml-system
tier: central
size: large
order: 2
lang: en
title: Hypertension ML System
tagline: 'End-to-end ML system on a real clinical dataset: it serves probabilities of cardiovascular risk and of hypertension estimated without measuring blood pressure, after auditing and fixing the target leakage of its first version.'
status: deployed
stack:
  - Python
  - FastAPI
  - Pydantic
  - scikit-learn
  - XGBoost
  - pandas
  - Streamlit
  - Render
  - GitHub Actions
links:
  repo: https://github.com/Elorro/hypertension-ml-system
  live: https://hypertensionmlsystem.streamlit.app/
  api_docs: https://hta-api.onrender.com/docs
metrics:
  - id: tests_passing
    label: Tests passing (full suite)
    value: 126
    epistemic: medido
    source: 'hypertension-ml-system@c704716; .venv with Python 3.14.10, with the CSV and the .pkl files present: 111 unmarked, 6 requires_artifacts and 9 requires_data'
    as_of: '2026-11-13'
    recompute: python -m pytest tests/ -q
  - id: auc_with_bp
    label: AUC, cardiovascular risk with blood pressure (A′, test)
    value: '0.8019 [0.7938 · 0.8088]'
    epistemic: medido
    source: 'hypertension-ml-system@c704716, models/dt4_manifest.json (run of 2026-09-25, code ad518f2); test evaluated once, already observed in DT-1'
    n: 13736
    as_of: '2026-09-25'
    recompute: 'make train-dt4 (≈ 7 min; needs the Kaggle CSV, which is not redistributed) · manifest reading: jq ''.experimentos.A_prima_principal.con_pa.test | {roc_auc, roc_auc_ic95_bootstrap}'' models/dt4_manifest.json'
  - id: auc_without_bp
    label: AUC, hypertension without blood pressure (B1, test)
    value: '0.6955 [0.6866 · 0.7049]'
    epistemic: medido
    source: 'hypertension-ml-system@c704716, models/dt4_manifest.json (run of 2026-09-25, code ad518f2); test evaluated once, already observed in DT-1'
    n: 13736
    as_of: '2026-09-25'
    recompute: 'make train-dt4 (≈ 7 min; needs the Kaggle CSV, which is not redistributed) · manifest reading: jq ''.experimentos.B1_experimento.principal.test | {roc_auc, roc_auc_ic95_bootstrap}'' models/dt4_manifest.json'
  - id: auc_drop_without_bp
    label: AUC lost by dropping blood pressure (A′, controlled ablation)
    value: '0.0991 [0.0919 · 0.1061]'
    epistemic: medido
    source: 'hypertension-ml-system@c704716, models/dt4_manifest.json (run of 2026-09-25); same configuration and same rows, paired bootstrap of 1,000 resamples'
    n: 13736
    as_of: '2026-09-25'
    recompute: 'make train-dt4 (≈ 7 min; needs the Kaggle CSV, which is not redistributed) · manifest reading: jq ''.experimentos.A_prima_principal.ablacion.principal_controlada | {delta_auc, ic95}'' models/dt4_manifest.json'
  - id: cold_start_s
    label: API cold start on Render (s)
    value: '42–83'
    epistemic: medido
    source: 'hypertension-ml-system@c704716 BITACORA.md (entries 2026-10-22 and 2026-11-13): 62.9 · 47.8 · 53.2 s and 82.58 · 44.71 · 42.38 · 43.14 s; a fifth sample on 2026-11-13 did not complete; free plan'
    n: 7
    as_of: '2026-11-13'
    recompute: 'after ≥ 1000 s without traffic: curl -s -o /dev/null -w ''%{time_total}\n'' -X POST https://hta-api.onrender.com/v1/riesgo-cardiovascular -H ''Content-Type: application/json'' -d ''{"age_years":52,"gender":1,"height":165,"weight":72,"cholesterol":1,"gluc":1,"smoke":0,"alco":0,"active":1,"ap_hi":130,"ap_lo":85}'''
  - id: demo_verified
    label: Live demo checked by hand
    value: 1
    epistemic: medido
    source: "author's manual check: the dashboard loads and works after the cold start (~2 min)"
    as_of: '2026-11-02'
    recompute: 'open https://hypertensionmlsystem.streamlit.app/, press the wake-up button if shown, and wait for it to load'
honest_limit: "A machine-learning engineering demo, not a clinical tool: there is no external or temporal validation (a single Kaggle dataset), no fairness analysis by sex or age, and the dataset's sex coding is an inference. The model without blood pressure (B1) discriminates only modestly: AUC 0.6955 and an accuracy just 3.35 points above always predicting the majority class; at a 0.5 threshold it leaves 3,257 false negatives against 1,458 true positives, which is why the API returns no class for B1. The test set had already been observed in the first run (DT-1): model selection did not use it, but it is not a virgin holdout, and the bootstrap interval bounds the test's sampling noise, not partition noise. Probabilities have no post-hoc calibration. The Kaggle CSV is not redistributed (unknown license), so reproducing the training requires downloading it, and 9 of the 126 tests need it and only run locally. The public API has no authentication or rate limiting. The demos run on free plans with cold starts (see the demo notice)."
live_caveat: 'The demo runs on free plans: the Streamlit dashboard takes about 2 minutes to wake up and the Render API took 42–83 s from cold (7 measurements); the two cold starts can chain. If it does not respond, the repository explains how to run it locally.'
case_study: true
---
# Summary

End-to-end ML system —training, REST service and dashboard— on the real Kaggle *Cardiovascular Disease* dataset (68,678 patients after cleaning). It serves two models: one estimates cardiovascular risk using blood pressure as an input; the other, experimental, estimates hypertension **without** measuring it. The project's first version had target leakage. This case describes how it was detected, how it was fixed, and what remains once fixed.

# Challenge

The original version trained on a synthetic dataset whose label was computed by applying thresholds to systolic and diastolic pressure, the same variables the model received as input. An untrained `if` rule reconstructed 91.1% of the labels, and a depth-8 tree already reached 94.8%; XGBoost, 95.3%. Those figures did not measure hypertension: they measured how much of an already-known rule the model relearned.

# Approach

First, an audit with a positive control. On the real dataset, with blood pressure left out of the features, the best deterministic rule the audit finds (a tree of depth ≤ 3) beats the majority-class baseline by only 2.28 accuracy points. With blood pressure put back into the features, the same machinery reconstructs the target at 99.27% (+33.60 points), which shows the search does detect leakage when it exists. It is a point estimate, without an interval.

Then, a preregistered model selection: the protocol was committed before training; each experiment compares 25 candidates by log-loss in 5-fold cross-validation on the training set, applies a one-standard-error rule with a declared simplicity order, and evaluates the test set once, on the selected model.

Finally, a service with a contract: it validates the training domain, the model without blood pressure rejects pressure with a 422 (anti-leakage contract) and, at startup, checks versions and sha256 of the artifacts against the manifest; if anything does not match, it does not start.

# Outcome

With blood pressure (A′), AUC 0.8019 [0.7938 · 0.8088]. Without it (B1), AUC 0.6955 [0.6866 · 0.7049] and an accuracy of 69.02% against a 65.67% baseline. Dropping blood pressure costs 0.0991 of AUC [0.0919 · 0.1061] in a controlled ablation: the same configuration, the same rows and a paired bootstrap.

Two corrections stayed in view. The figure from the first run on real data (DT-1), 0.1103, was inflated because it compared against an SVM chosen by macro-F1; the controlled measure replaced it. And in B1 the gain from the preregistered selection was not in AUC (from 0.6941 to 0.6955, within noise) but in overfitting and size: the train-to-test AUC gap fell from 0.109 to 0.014 and the model went from 70 to 5.5 MB. The protocol also predicted that the new selection would not beat the previous one; that did not fully hold, because on the two served models it came out equal or marginally above, within the interval.

What remains without blood pressure is modest. At a 0.5 threshold, B1 leaves 3,257 false negatives against 1,458 true positives: the information is in the ranking, not in the binary decision, which is why the API returns only a probability for that model. The full list of limits is in the known-limit note on the card.
