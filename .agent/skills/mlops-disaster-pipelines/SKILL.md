---
name: mlops-disaster-pipelines
description: MLOps lifecycle for disaster AI models, reproducible training pipelines, drift monitoring, historical disaster holdouts, and ONNX serving.
---

# MLOps Disaster Pipelines Skill

## 1. Purpose
Establish a robust, reproducible MLOps lifecycle for training, versioning, evaluating, testing, and safely deploying disaster prediction models. Guarantees that AI models deployed to Northeast India field operations are resilient, auditable, and battle-tested against historical monsoon catastrophes.

---

## 2. Core Rules & Requirements

1. **Reproducible Pipeline Orchestration**:
   - Fix all random seeds (`numpy.random.seed(42)`, `torch.manual_seed(42)`).
   - Bundle preprocessing steps (imputation, scaling, one-hot encoding) inside `sklearn.pipeline.Pipeline` or `ColumnTransformer`.
   - Never save raw weights without the associated transformer pipeline and input column manifest.

2. **Data Provenance & Versioning**:
   - Every training dataset must record data lineage:
     - `source`: IMD radar, CWC gauges, Open-Meteo, NASA GPM.
     - `collection_window`: Start and end date.
     - `season_tag`: `MONSOON_PEAK`, `PRE_MONSOON`, `DRY_WINTER`.
     - `synthetic_ratio`: Percentage of augmented or simulated cloudburst events.

3. **Historical Disaster Holdout Testing**:
   - Standard random k-fold cross-validation leaks temporal information in disaster datasets.
   - **Mandatory Holdout Test Suite**: All candidate models must be evaluated against separate, un-seen historical disaster episodes:
     1. *2022 Barak Valley Deluge (Silchar)*: 300mm+ precipitation, urban inundation.
     2. *2024 Sela Pass NH-13 Massive Rockslide*: High-slope mountain cutoff.
     3. *2023 Dima Hasao Railway & NH-6 Cutoff*: Mudslide cluster.
   - A model cannot be promoted to production if it misses > 10% of true catastrophic events in historical holdouts.

4. **Inference Latency Budget**:
   - Single-coordinate risk inference must return in < 10ms.
   - Corridor batch inference (100+ waypoints) must return in < 80ms.
   - Export tabular models to **ONNX** format (`skl2onnx`, `onnxruntime`) to eliminate Python runtime overhead.

5. **Monsoon Concept Drift Monitoring**:
   - Monitor live incoming telemetry for statistical drift compared to training baselines.
   - Apply Kolmogorov-Smirnov (KS) test on continuous features (rainfall intensity, soil moisture) and Population Stability Index (PSI) on predicted risk distributions.
   - Trigger automated alert if PSI > 0.20 or p-value < 0.01.

6. **Canary & Shadow Deployment Workflow**:
   - New model weights are deployed first in `SHADOW` mode, generating parallel predictions alongside the baseline model without impacting live routing.
   - After 48 hours with zero crashes and >95% concordance with ground-truth reports, promote to `ACTIVE`.

---

## 3. Required Technologies & Libraries
- **Pipelines & Serialization**: `scikit-learn>=1.5.0`, `joblib>=1.4.0`, `skl2onnx>=1.17.0`, `onnxruntime>=1.18.0`
- **Data Versioning**: `dvc>=3.50.0` or git-lfs manifests
- **Drift Monitoring**: `scipy.stats` (KS-Test), `evidently>=0.4.0` (optional)
- **Tracking & Metadata**: `pydantic>=2.10.0`, SQLite metadata registry

---

## 4. Implementation Guidance for SmartLogix

### Model Evaluation on Historical Holdout Suite
```python
import numpy as np
from sklearn.metrics import fbeta_score, precision_recall_curve, auc

def evaluate_disaster_holdout(model, X_holdout: np.ndarray, y_holdout: np.ndarray, disaster_name: str) -> dict:
    y_probs = model.predict_proba(X_holdout)[:, 1]
    y_pred_threshold = (y_probs >= 0.55).astype(int)
    
    # F2-score weights recall twice as high as precision
    f2 = fbeta_score(y_holdout, y_pred_threshold, beta=2.0)
    precision, recall, _ = precision_recall_curve(y_holdout, y_probs)
    pr_auc = auc(recall, precision)
    
    missed_catastrophes = int(np.sum((y_holdout == 1) & (y_pred_threshold == 0)))
    total_catastrophes = int(np.sum(y_holdout == 1))
    miss_rate = missed_catastrophes / max(total_catastrophes, 1)
    
    passed = miss_rate <= 0.10
    
    return {
        "disaster": disaster_name,
        "f2_score": round(float(f2), 4),
        "pr_auc": round(float(pr_auc), 4),
        "miss_rate": round(float(miss_rate), 4),
        "passed": passed
    }
```

---

## 5. Validation & Testing Requirements
- **Holdout Suite Execution**: Ensure test script runs against all three Northeast benchmark disasters.
- **Latency Benchmarking**: Profile 500 consecutive inferences; assert 99th percentile latency < 20ms.
- **Deterministic Pipeline Hash**: Verify that saving and reloading the `.joblib` / `.onnx` bundle produces identical predictions to within 10^-6 numerical tolerance.
- **Drift Simulation**: Inject synthetic extreme rain distribution; assert drift monitor triggers warning flag.

---

## 6. Integration Guidance
- Manages training and serialization of `.agent/skills/disaster-ml-prediction`.
- Deploys optimized model artifacts directly to `backend/app/ml/artifacts/`.
