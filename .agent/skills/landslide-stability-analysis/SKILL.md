---
name: landslide-stability-analysis
description: Deterministic geotechnical slope stability analysis, Infinite Slope model, pore-water pressure dynamics, and Factor of Safety (FoS) calculations.
---

# Geotechnical Landslide Stability Skill

## 1. Purpose
Calculate physics-based geotechnical slope stability and rockslide risk along mountain corridors (NH-13, NH-6, NH-29) in the young, fractured geology of Northeast India. Computes the deterministic Factor of Safety (FS) based on soil shear strength, slope gradient, and rainfall-induced pore-water pressure.

---

## 2. Core Rules & Requirements

1. **Infinite Slope Model (Mohr-Coulomb Physics)**:
   - Calculate Factor of Safety (FS) along planar slip surfaces parallel to mountain slopes:
     FS = Resisting Shear Strength / Driving Shear Stress
     
     FS = [ c' + (gamma_sat * z * cos^2(beta) - u) * tan(phi') ] / [ gamma_sat * z * sin(beta) * cos(beta) ]
     
     Where:
     - c': Effective soil cohesion (kPa, typically 12-30 kPa for Himalayan regolith).
     - gamma_sat: Saturated soil unit weight (kN/m^3, typically 18.5-20.5 kN/m^3).
     - z: Depth to slip failure surface (meters, typically 2.0-4.0 m).
     - beta: Slope angle from DEM (degrees).
     - u: Pore-water pressure (kPa): u = gamma_w * m * z * cos^2(beta), where m in [0, 1] is water table saturation ratio.
     - phi': Effective internal angle of friction (degrees, typically 26-36 deg).
     - gamma_w: Water unit weight (9.81 kN/m^3).

2. **Factor of Safety (FS) Risk Categories**:
   - FS > 1.30: `STABLE` (Adequate physical safety margin; normal operations).
   - 1.00 <= FS <= 1.30: `MARGINALLY STABLE / HIGH RISK` (Active soil creep; prepare bypasses).
   - FS < 1.00: `IMMINENT FAILURE / CRITICAL` (Driving shear exceeds resistance; slope collapse underway; close road).

3. **Rainfall-Induced Pore Pressure Dynamics**:
   - Model the saturation ratio m as a dynamic function of cumulative rainfall and soil hydraulic conductivity K_sat:
     dm/dt = (Rainfall_Rate - Drainage_Rate) / Soil_Porosity
   - When 48h rainfall causes m -> 1.0 (water table reaches ground surface), pore pressure u maximizes, drastically reducing effective stress and triggering sudden shear failure.

4. **Road Cutting Geometric Amplification**:
   - Road construction often cuts the toe of mountain slopes, creating a local over-steepened face:
     beta_cut = beta_natural + Delta_cut (e.g. 45-65 degrees).
   - Stability analysis must evaluate both the broad hillside slope (beta_natural) and the highway cut slope (beta_cut).

5. **Empirical-Physical Hybrid Verification**:
   - Validate FS outputs against regional empirical rainfall intensity-duration thresholds (GSI / Caine):
     I_critical = 14.82 * Duration^(-0.39) (mm/hr)
   - If physical FS < 1.0 AND rainfall exceeds I_critical, raise the alert certainty to `Observed` / `Extreme`.

---

## 3. Required Technologies & Libraries
- **Numerical Computing**: `numpy>=1.26.0`, `scipy>=1.13.0`
- **Elevation Raster Extraction**: `rasterio>=1.3.0`
- **Spatial Geometry**: `shapely>=2.0.0`
- **Validation**: `pydantic>=2.10.0`

---

## 4. Implementation Guidance for SmartLogix

### Infinite Slope Factor of Safety Calculator
```python
import numpy as np

def calculate_factor_of_safety(
    slope_deg: float,
    saturation_ratio: float,  # m in [0.0 (dry) to 1.0 (fully saturated)]
    soil_depth_m: float = 2.5,
    cohesion_kpa: float = 18.0,
    friction_angle_deg: float = 30.0,
    unit_weight_kn_m3: float = 19.0
) -> dict:
    beta = np.radians(slope_deg)
    phi = np.radians(friction_angle_deg)
    gamma_w = 9.81  # kN/m^3
    gamma = unit_weight_kn_m3
    z = soil_depth_m
    m = min(max(saturation_ratio, 0.0), 1.0)
    
    # Driving shear stress
    driving_stress = gamma * z * np.sin(beta) * np.cos(beta)
    
    # Pore-water pressure
    pore_pressure = m * gamma_w * z * (np.cos(beta) ** 2)
    
    # Effective normal stress
    total_normal_stress = gamma * z * (np.cos(beta) ** 2)
    effective_normal_stress = max(total_normal_stress - pore_pressure, 0.0)
    
    # Resisting shear strength (Mohr-Coulomb)
    resisting_stress = cohesion_kpa + effective_normal_stress * np.tan(phi)
    
    if driving_stress <= 0:
        fs = 99.0
    else:
        fs = float(resisting_stress / driving_stress)
        
    status = "STABLE" if fs > 1.30 else ("MARGINAL" if fs >= 1.00 else "UNSTABLE_FAILURE")
    
    return {
        "slope_deg": slope_deg,
        "saturation_ratio": m,
        "factor_of_safety": round(fs, 3),
        "stability_status": status,
        "effective_normal_stress_kpa": round(float(effective_normal_stress), 2),
        "driving_shear_stress_kpa": round(float(driving_stress), 2),
        "failure_imminent": fs < 1.0
    }
```

---

## 5. Validation & Testing Requirements
- **Dry Slope Baseline**: Test a dry 20-degree slope (m=0); assert FS > 1.8.
- **Saturated Critical Slope**: Test a 45-degree slope with m=1.0 and cohesion 15 kPa; assert FS < 1.0 (`UNSTABLE_FAILURE`).
- **Zero Slope Boundary**: Test 0-degree slope; assert no division by zero and status is `STABLE`.
- **Parameter Bounds**: Clamp input saturation ratio strictly to [0.0, 1.0].

---

## 6. Integration Guidance
- Receives slope angle beta from `.agent/skills/geospatial-gis-engine` (DEM profiling).
- Receives rainfall infiltration estimates from `.agent/skills/disaster-data-ingestion`.
- Feeds physics-based instability alerts to `.agent/skills/disaster-ml-prediction` as a deterministic constraint and `.agent/skills/cap-emergency-alerts` for roadblock notifications.
