---
name: disaster-ml-prediction
description: Machine learning models for rainfall-triggered landslides, flash floods, and multi-hazard disaster risk prediction in Northeast India.
---

# Disaster ML Prediction Skill

## 1. Purpose
Train, evaluate, calibrate, and serve production-grade machine learning models for disaster early warning across Northeast India corridors. This includes predicting rainfall-induced landslides, riverine/flash flood occurrences, and composite road vulnerability scores for the SmartLogix navigation engine.

---

## 2. Core Rules & Requirements

1. **Explicit Feature Engineering**:
   - **Antecedent Precipitation Index (API)**: Always calculate multi-scale cumulative rainfall:
     - API_3 = sum_{t=1}^{3} P_t * k^t (immediate saturation)
     - API_7 = sum_{t=1}^{7} P_t * k^t (soil pore pressure buildup)
     - API_14 = sum_{t=1}^{14} P_t * k^t (deep geological saturation)
     - Standard decay coefficient: k = 0.82 for Eastern Himalayan geology.
   - **Geomorphological Features**: Integrate terrain slope angle (degrees), elevation (meters), road cutting angle, distance to riverbank, and soil classification.

2. **Model Architecture Selection**:
   - **Tabular Risk & Landslide Susceptibility**: Use **XGBoost** (`XGBClassifier`) or **LightGBM** (`LGBMClassifier`) with monotonic constraints where applicable (e.g., higher rainfall must monotonically increase risk).
   - **River Gauge & Runoff Forecasting**: Use **1D CNN-LSTM** or **GRU** recurrent architectures for sequence-to-sequence water level forecasting over 3h, 6h, and 12h horizons.

3. **Extreme Class Imbalance Handling**:
   - Disaster events represent < 3% of historical time samples.
   - Never train with naive 50/50 balance or evaluate on raw accuracy.
   - Employ `scale_pos_weight` in XGBoost, or SMOTE-Tomek links within cross-validation folds.
   - **Evaluation Priority**:
     - **F2-Score** (penalizes false negatives heavily—missing a disaster is catastrophic).
     - **PR-AUC** (Precision-Recall Area Under Curve).
     - Full confusion matrix inspection at varying decision thresholds.

4. **Calibrated Probabilities & Explainability**:
   - Calibrate raw classifier outputs using Isotonic Regression or Platt Scaling to ensure confidence matches real observed frequencies.
   - Every inference response MUST provide feature attributions (using SHAP TreeExplainer or gain percentages), explaining why a corridor is classified as High/Critical risk.

5. **Deterministic Fail-Safe Fallbacks**:
   - If model inference raises an exception, inputs are corrupted, or remote telemetry is unavailable, the system MUST NOT fail silently or crash.
   - Immediately switch to the empirical Caine/Guzzetti rainfall-intensity threshold equation:
     I = alpha * D^(-beta)
   - Flag the output explicitly with `model_status: "FALLBACK_EMPIRICAL"`.

---

## 3. Required Technologies & Libraries
- **Modeling**: `scikit-learn>=1.5.0`, `xgboost>=2.0.0`, `lightgbm>=4.0.0`
- **Time-Series**: `torch>=2.0.0` or `statsmodels>=0.14.0`
- **Data & Math**: `numpy>=1.26.0`, `pandas>=2.2.0`, `scipy>=1.13.0`
- **Explainability**: `shap>=0.45.0`
- **Serialization**: `joblib>=1.4.0`, `onnxruntime>=1.18.0`

---

## 4. Implementation Guidance for SmartLogix

### Feature Matrix Construction
```python
def compute_disaster_features(hourly_rain_series: list[float], slope_deg: float, soil_type_code: int) -> dict:
    rain_24h = sum(hourly_rain_series[-24:])
    rain_72h = sum(hourly_rain_series[-72:])
    
    # API calculation with decay k=0.82
    api_3 = sum(hourly_rain_series[-(d*24):-((d-1)*24) or None][0] * (0.82 ** d) for d in range(1, 4))
    api_7 = sum(hourly_rain_series[-(d*24):-((d-1)*24) or None][0] * (0.82 ** d) for d in range(1, 8))
    api_14 = sum(hourly_rain_series[-(d*24):-((d-1)*24) or None][0] * (0.82 ** d) for d in range(1, 15))
    
    return {
        "rain_24h_mm": rain_24h,
        "rain_72h_mm": rain_72h,
        "api_3": api_3,
        "api_7": api_7,
        "api_14": api_14,
        "slope_deg": slope_deg,
        "soil_type": soil_type_code,
        "intensity_ratio": rain_24h / (rain_72h + 1e-4)
    }
```

### Risk Category Thresholding
Map continuous probability P(Hazard):
- P < 0.25: `LOW` (Normal operations)
- 0.25 <= P < 0.55: `MODERATE` (Monitor telemetry, alert maintenance)
- 0.55 <= P < 0.80: `HIGH` (Prepare detours, speed restrictions)
- P >= 0.80: `CRITICAL` (Corridor closed, trigger emergency rerouting)

---

## 5. Validation & Testing Requirements
- **Unit Tests**: Test feature extraction against known synthetic rainfall vectors.
- **Threshold Tests**: Verify that rainfall exceeding 150mm/24h triggers at least `HIGH` risk under all slope conditions.
- **Fail-Safe Tests**: Pass `None`, `NaN`, and negative rainfall into inference; assert that fallback empirical calculations return gracefully.
- **Explainability Tests**: Ensure SHAP top features sum to valid relative percentages.

---

## 6. Integration Guidance
- Connects upstream to `.agent/skills/data-ingestion` for validated meteorological inputs.
- Delivers downstream risk scores to `.agent/skills/geospatial-gis-engine` for road segment weighting and `.agent/skills/cap-emergency-alerts` for notification dispatch.
