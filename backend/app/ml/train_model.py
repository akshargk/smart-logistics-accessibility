"""
SmartLogix SIH Backend — ML Risk Model Training Pipeline
Framework: scikit-learn (RandomForestRegressor Pipeline)

DATASET NOTICE:
This model trains on a clearly documented Synthetic Northeast India SIH Calibration
Dataset (1,500 samples). This dataset is NOT real-world historical disaster mortality/loss
data. It is a calibrated synthetic dataset designed for the SIH prototype demonstration,
derived from hydrological riverfront inundation curves and geotechnical slope risk models.

Methodology follows ml-best-practices:
  1. Strict train/test split (80/20) before fitting preprocessing or estimators
  2. 5-Fold Cross-Validation on training data
  3. Baseline comparisons: Dummy Mean Regressor, Ridge Regression, and Random Forest
  4. Full metrics tracking: MAE, RMSE, R²
  5. Artifact serialization: joblib model pipeline + JSON metadata & feature importances
"""

import json
import os
from pathlib import Path
import numpy as np
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib

FEATURE_NAMES = [
    "min_hazard_dist_km",          # Distance to nearest disaster epicenter
    "hazard_radius_ratio",         # dist / radius (<1 = inside, 1-1.5 = buffer, >1.5 = clear)
    "hazard_severity_weight",      # LOW=15, MED=40, HIGH=70, CRITICAL=95
    "overlapping_hazards_count",   # Count of overlapping active hazard zones (0-4)
    "rainfall_mm_per_hr",          # Precipitation rate in mm/hr (simulated / telemetry)
    "wind_speed_kmh",              # Wind velocity km/h (simulated / telemetry)
    "terrain_vulnerability_index", # Low-lying alluvial basin=0.85, steep slope=0.90, elevated=0.30
    "route_transit_km",            # Trajectory length from origin to shelter
    "shelter_occupancy_ratio",     # current_occupancy / capacity (0.0 - 1.0)
]

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_FILE = ARTIFACTS_DIR / "risk_model.joblib"
META_FILE = ARTIFACTS_DIR / "model_meta.json"


def generate_synthetic_calibration_data(n_samples: int = 1500, random_state: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic calibration dataset representing Northeast India terrain & hazard scenarios.
    Explicitly synthetic: simulates physical compound risk curves without claiming to be historical telemetry.
    """
    rng = np.random.default_rng(random_state)

    # 1. min_hazard_dist_km (0.1 to 35 km)
    min_dist = rng.uniform(0.1, 35.0, size=n_samples)

    # 2. hazard_radius_ratio (0.05 to 2.5)
    # Radii in NE India range roughly 8 to 25 km
    radius = rng.choice([8.0, 12.0, 15.0, 18.0, 22.0], size=n_samples)
    hazard_radius_ratio = min_dist / radius

    # 3. hazard_severity_weight
    hazard_severity = rng.choice([15.0, 40.0, 70.0, 95.0], p=[0.20, 0.35, 0.30, 0.15], size=n_samples)

    # 4. overlapping_hazards_count (0 to 4)
    overlapping_hazards = rng.choice([0, 1, 2, 3], p=[0.45, 0.35, 0.15, 0.05], size=n_samples)

    # 5. rainfall_mm_per_hr (0 to 110 mm/hr, monsoon heavy showers)
    rainfall = rng.exponential(scale=24.0, size=n_samples)
    rainfall = np.clip(rainfall, 0.0, 120.0)

    # 6. wind_speed_kmh (5 to 85 km/h)
    wind = rng.normal(loc=28.0, scale=14.0, size=n_samples)
    wind = np.clip(wind, 4.0, 90.0)

    # 7. terrain_vulnerability_index (alluvial basin=0.85, steep slope=0.90, elevated plateau=0.30)
    terrain_types = rng.choice([0.30, 0.55, 0.85, 0.90], p=[0.25, 0.25, 0.30, 0.20], size=n_samples)
    terrain_vulnerability = np.clip(terrain_types + rng.normal(0, 0.03, size=n_samples), 0.1, 1.0)

    # 8. route_transit_km (0.5 to 28 km)
    route_dist = rng.uniform(0.5, 28.0, size=n_samples)

    # 9. shelter_occupancy_ratio (0.0 to 1.0)
    occupancy = rng.beta(a=2.0, b=3.0, size=n_samples)

    X = np.column_stack([
        min_dist,
        hazard_radius_ratio,
        hazard_severity,
        overlapping_hazards,
        rainfall,
        wind,
        terrain_vulnerability,
        route_dist,
        occupancy,
    ])

    # ── Synthetic Target Construction (Physics-Informed Compound Risk 0-100) ──
    # Proximity decay factor (1.0 at epicenter, decays as ratio exceeds 1.0)
    proximity_decay = np.exp(-1.4 * np.maximum(hazard_radius_ratio - 0.2, 0))
    hazard_component = (hazard_severity * 0.55) * proximity_decay

    # Weather amplification: heavy rainfall severely exacerbates flood & landslide risk on vulnerable terrain
    weather_multiplier = 1.0 + (rainfall / 55.0) * terrain_vulnerability
    amplified_hazard = hazard_component * np.clip(weather_multiplier, 0.8, 1.8)

    # Overlapping hazards compounding bonus
    multi_hazard_penalty = overlapping_hazards * 7.5

    # Route exposure and shelter congestion penalty
    route_exposure = np.minimum(route_dist * 0.45, 12.0)
    congestion_penalty = np.where(occupancy > 0.80, (occupancy - 0.80) * 35.0, 0.0)

    # Random natural variance (noise)
    noise = rng.normal(0, 2.2, size=n_samples)

    y = amplified_hazard + multi_hazard_penalty + route_exposure + congestion_penalty + noise
    y = np.clip(y, 0.0, 100.0)

    return X, y


def train_and_evaluate(save_artifacts: bool = True) -> dict:
    """
    Train, validate, evaluate and serialize the scikit-learn risk prediction pipeline.
    """
    print("=" * 65)
    print(" SmartLogix ML — Training Synthetic NE India Risk Model")
    print("=" * 65)

    X, y = generate_synthetic_calibration_data(n_samples=1500, random_state=42)

    # 1. Strict Train/Test Separation (80% Train, 20% Test) BEFORE fitting
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    print(f"Dataset Split: {len(X_train)} Train samples, {len(X_test)} Test samples")

    # 2. Baseline Model 1: Dummy Mean Regressor
    dummy = DummyRegressor(strategy="mean")
    dummy.fit(X_train, y_train)
    dummy_pred = dummy.predict(X_test)
    dummy_mae = float(mean_absolute_error(y_test, dummy_pred))
    dummy_rmse = float(np.sqrt(mean_squared_error(y_test, dummy_pred)))
    dummy_r2 = float(r2_score(y_test, dummy_pred))
    print(f"\n[Baseline 1 - Dummy Mean] MAE: {dummy_mae:.2f} | RMSE: {dummy_rmse:.2f} | R²: {dummy_r2:.4f}")

    # 3. Baseline Model 2: Regularized Linear Model (Ridge)
    ridge_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("ridge", Ridge(alpha=1.0, random_state=42)),
    ])
    ridge_pipe.fit(X_train, y_train)
    ridge_pred = ridge_pipe.predict(X_test)
    ridge_mae = float(mean_absolute_error(y_test, ridge_pred))
    ridge_rmse = float(np.sqrt(mean_squared_error(y_test, ridge_pred)))
    ridge_r2 = float(r2_score(y_test, ridge_pred))
    print(f"[Baseline 2 - Ridge Reg] MAE: {ridge_mae:.2f} | RMSE: {ridge_rmse:.2f} | R²: {ridge_r2:.4f}")

    # 4. Champion Model: RandomForestRegressor Pipeline
    rf_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestRegressor(
            n_estimators=40,
            max_depth=5,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=1,
        )),
    ])

    # 5. 5-Fold Cross Validation on Training Data
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores_neg_mae = cross_val_score(rf_pipe, X_train, y_train, cv=cv, scoring="neg_mean_absolute_error")
    cv_mae_scores = (-cv_scores_neg_mae).tolist()
    cv_mae_mean = float(np.mean(cv_mae_scores))
    cv_mae_std = float(np.std(cv_mae_scores))
    print(f"\n[Champion RF - 5-Fold CV] MAE: {cv_mae_mean:.2f} (+/- {cv_mae_std:.2f})")

    # 6. Fit Champion Pipeline on Full Training Set
    rf_pipe.fit(X_train, y_train)

    # 7. Final Evaluation on Held-Out Test Set
    y_pred = rf_pipe.predict(X_test)
    test_mae = float(mean_absolute_error(y_test, y_pred))
    test_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    test_r2 = float(r2_score(y_test, y_pred))
    print(f"[Champion RF - Test Set]  MAE: {test_mae:.2f} | RMSE: {test_rmse:.2f} | R²: {test_r2:.4f}")

    # 8. Feature Importances Extraction
    rf_estimator: RandomForestRegressor = rf_pipe.named_steps["rf"]
    importances = rf_estimator.feature_importances_
    feat_imp_dict = {
        name: round(float(imp), 4)
        for name, imp in sorted(zip(FEATURE_NAMES, importances), key=lambda x: x[1], reverse=True)
    }

    print("\nFeature Importances (Gini Breakdown):")
    for feat, imp in feat_imp_dict.items():
        print(f"  • {feat:28s}: {imp * 100:5.2f}%")

    metrics_report = {
        "model_type": "Pipeline(StandardScaler -> RandomForestRegressor)",
        "framework": "scikit-learn",
        "dataset_notice": "Calibrated Synthetic Northeast India Exposure Dataset (1,500 samples). Not real historical loss data.",
        "cv_5fold_mae_mean": round(cv_mae_mean, 2),
        "cv_5fold_mae_std": round(cv_mae_std, 2),
        "test_mae": round(test_mae, 2),
        "test_rmse": round(test_rmse, 2),
        "test_r2": round(test_r2, 4),
        "baseline_comparison": {
            "dummy_mean_mae": round(dummy_mae, 2),
            "ridge_mae": round(ridge_mae, 2),
            "rf_mae": round(test_mae, 2),
            "mae_reduction_vs_baseline_pct": round(((dummy_mae - test_mae) / dummy_mae) * 100, 1),
        },
        "feature_importances": feat_imp_dict,
        "feature_names": FEATURE_NAMES,
    }

    if save_artifacts:
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(rf_pipe, MODEL_FILE)
        with open(META_FILE, "w", encoding="utf-8") as f:
            json.dump(metrics_report, f, indent=2)
        print(f"\nArtifacts saved successfully:")
        print(f"  • Model pipeline: {MODEL_FILE}")
        print(f"  • Model metadata: {META_FILE}")

    return {
        "pipeline": rf_pipe,
        "metrics": metrics_report,
    }


if __name__ == "__main__":
    train_and_evaluate(save_artifacts=True)
