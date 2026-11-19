---
slug: hypertension-ml-system
tier: central
size: large
order: 2
lang: es
title: Hypertension ML System
tagline: 'Sistema de ML de extremo a extremo sobre un dataset clínico real: sirve probabilidades de riesgo cardiovascular y de hipertensión estimada sin medir la presión, tras auditar y corregir el target leakage de su primera versión.'
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
    label: Pruebas aprobadas (suite completa)
    value: 126
    epistemic: medido
    source: 'hypertension-ml-system@c704716; .venv con Python 3.14.10, con el CSV y los .pkl presentes: 111 sin marcador, 6 requires_artifacts y 9 requires_data'
    as_of: '2026-11-13'
    recompute: python -m pytest tests/ -q
  - id: auc_with_bp
    label: AUC de riesgo cardiovascular, con presión (A′, test)
    value: '0,8019 [0,7938 · 0,8088]'
    epistemic: medido
    source: 'hypertension-ml-system@c704716, models/dt4_manifest.json (corrida del 2026-09-25, código ad518f2); test evaluado una sola vez, ya observado en DT-1'
    n: 13736
    as_of: '2026-09-25'
    recompute: 'make train-dt4 (≈ 7 min; necesita el CSV de Kaggle, que no se redistribuye) · lectura del manifiesto: jq ''.experimentos.A_prima_principal.con_pa.test | {roc_auc, roc_auc_ic95_bootstrap}'' models/dt4_manifest.json'
  - id: auc_without_bp
    label: AUC de hipertensión sin presión (B1, test)
    value: '0,6955 [0,6866 · 0,7049]'
    epistemic: medido
    source: 'hypertension-ml-system@c704716, models/dt4_manifest.json (corrida del 2026-09-25, código ad518f2); test evaluado una sola vez, ya observado en DT-1'
    n: 13736
    as_of: '2026-09-25'
    recompute: 'make train-dt4 (≈ 7 min; necesita el CSV de Kaggle, que no se redistribuye) · lectura del manifiesto: jq ''.experimentos.B1_experimento.principal.test | {roc_auc, roc_auc_ic95_bootstrap}'' models/dt4_manifest.json'
  - id: auc_drop_without_bp
    label: Pérdida de AUC al quitar la presión (A′, ablación controlada)
    value: '0,0991 [0,0919 · 0,1061]'
    epistemic: medido
    source: 'hypertension-ml-system@c704716, models/dt4_manifest.json (corrida del 2026-09-25); misma configuración y mismas filas, bootstrap pareado de 1.000 remuestreos'
    n: 13736
    as_of: '2026-09-25'
    recompute: 'make train-dt4 (≈ 7 min; necesita el CSV de Kaggle, que no se redistribuye) · lectura del manifiesto: jq ''.experimentos.A_prima_principal.ablacion.principal_controlada | {delta_auc, ic95}'' models/dt4_manifest.json'
  - id: cold_start_s
    label: Arranque en frío de la API en Render (s)
    value: '42–83'
    epistemic: medido
    source: 'BITACORA.md de hypertension-ml-system@c704716 (entradas 2026-10-22 y 2026-11-13): 62,9 · 47,8 · 53,2 s y 82,58 · 44,71 · 42,38 · 43,14 s; una quinta muestra del 2026-11-13 no completó; plan gratuito'
    n: 7
    as_of: '2026-11-13'
    recompute: 'tras ≥ 1000 s sin tráfico: curl -s -o /dev/null -w ''%{time_total}\n'' -X POST https://hta-api.onrender.com/v1/riesgo-cardiovascular -H ''Content-Type: application/json'' -d ''{"age_years":52,"gender":1,"height":165,"weight":72,"cholesterol":1,"gluc":1,"smoke":0,"alco":0,"active":1,"ap_hi":130,"ap_lo":85}'''
  - id: demo_verified
    label: Demo en vivo verificada a mano
    value: 1
    epistemic: medido
    source: 'prueba manual del autor: el dashboard carga y funciona tras el arranque en frío (~2 min)'
    as_of: '2026-11-02'
    recompute: 'abrir https://hypertensionmlsystem.streamlit.app/, pulsar el botón de despertar si aparece y esperar a que cargue'
honest_limit: 'Demostración de ingeniería de ML, no una herramienta clínica: no hay validación externa ni temporal (un solo dataset de Kaggle), ni análisis de equidad por sexo o edad, y la codificación del sexo en el dataset es una inferencia. El modelo sin presión arterial (B1) discrimina poco: AUC 0,6955 y una accuracy solo 3,35 puntos por encima de predecir siempre la clase mayoritaria; con umbral 0,5 deja 3.257 falsos negativos frente a 1.458 verdaderos positivos, y por eso la API no devuelve clase para B1. El conjunto de test ya se había observado en la primera corrida (DT-1): la selección de modelo no lo usó, pero no es un holdout virgen, y el intervalo bootstrap acota el ruido de muestreo del test, no el de partición. Las probabilidades no tienen calibración post-hoc. El CSV de Kaggle no se redistribuye (licencia desconocida), así que reproducir el entrenamiento exige descargarlo, y 9 de los 126 tests lo requieren y solo corren en local. La API pública no tiene autenticación ni límite de peticiones. Las demos usan planes gratuitos con arranque en frío (ver el aviso de la demo).'
live_caveat: 'La demo corre en planes gratuitos: el dashboard de Streamlit tarda unos 2 minutos en despertar y la API de Render tardó entre 42 y 83 s en frío (7 mediciones); los dos arranques pueden encadenarse. Si no responde, el repositorio explica cómo ejecutarla en local.'
case_study: true
---
# Resumen

Sistema de ML de extremo a extremo —entrenamiento, servicio REST y dashboard— sobre el dataset real *Cardiovascular Disease* de Kaggle (68.678 pacientes tras la limpieza). Sirve dos modelos: uno estima riesgo cardiovascular usando la presión arterial como entrada; el otro, experimental, estima hipertensión **sin** medirla. La primera versión del proyecto tenía target leakage. Este caso cuenta cómo se detectó, cómo se corrigió y qué queda una vez corregido.

# Reto

La versión original entrenaba con un dataset sintético cuya etiqueta se calculaba aplicando umbrales a la presión sistólica y diastólica, las mismas variables que recibía el modelo. Una regla `if` sin entrenar reconstruía el 91,1 % de las etiquetas, y un árbol de profundidad 8 ya llegaba al 94,8 %; XGBoost, al 95,3 %. Esas cifras no medían hipertensión: medían cuánto de una regla ya conocida reaprendía el modelo.

# Enfoque

Primero, una auditoría con control positivo. Sobre el dataset real, sin la presión entre las features, la mejor regla determinista que encuentra la auditoría (un árbol de profundidad ≤ 3) supera al baseline de clase mayoritaria por solo 2,28 puntos de accuracy. Con la presión devuelta a las features, la misma maquinaria reconstruye el target al 99,27 % (+33,60 puntos), lo que muestra que el buscador sí detecta leakage cuando existe. Es una estimación puntual, sin intervalo.

Después, una selección de modelo preregistrada: el protocolo se commiteó antes de entrenar; cada experimento compara 25 candidatos por log-loss en validación cruzada de 5 folds sobre el train, aplica una regla de un error estándar con un orden de simplicidad declarado y evalúa el test una sola vez sobre el seleccionado.

Por último, un servicio con contrato: valida el dominio de entrenamiento, el modelo sin presión rechaza la presión con un 422 (contrato anti-leakage) y, al arrancar, verifica versiones y sha256 de los artefactos contra el manifiesto; si algo no coincide, no arranca.

# Resultado

Con presión (A′), AUC 0,8019 [0,7938 · 0,8088]. Sin presión (B1), AUC 0,6955 [0,6866 · 0,7049] y una accuracy de 69,02 % frente al 65,67 % del baseline. Quitar la presión cuesta 0,0991 de AUC [0,0919 · 0,1061] en una ablación controlada: la misma configuración, las mismas filas y bootstrap pareado.

Dos correcciones quedaron a la vista. La cifra de la primera corrida sobre datos reales (DT-1), 0,1103, estaba inflada porque comparaba contra una SVM elegida por macro-F1; la reemplazó la medida controlada. Y en B1 la mejora de la selección preregistrada no fue de AUC (de 0,6941 a 0,6955, dentro del ruido) sino de sobreajuste y tamaño: la brecha de AUC entre train y test bajó de 0,109 a 0,014 y el modelo pasó de 70 a 5,5 MB. El protocolo también preveía que la nueva selección no superaría a la anterior; no se cumplió del todo, porque en los dos modelos servidos quedó igual o marginalmente por encima, dentro del intervalo.

Lo que queda sin presión es modesto. Con umbral 0,5, B1 deja 3.257 falsos negativos frente a 1.458 verdaderos positivos: la información está en el ranking, no en la decisión binaria, y por eso la API devuelve solo una probabilidad para ese modelo. Los límites completos están en la nota de límite conocido de la tarjeta.
