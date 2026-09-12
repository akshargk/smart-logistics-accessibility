---
name: remote-sensing-disaster-detection
description: Satellite remote sensing workflows using Sentinel-1 SAR (all-weather radar) and Sentinel-2 optical imagery for flood extent mapping and landslide scar detection.
---

# Remote Sensing Disaster Detection Skill

## 1. Purpose
Process and analyze Earth Observation (EO) satellite imagery to detect physical ground hazards: flooded roads, submerged settlements, expanding river channels, and slope failure scars. Overcomes persistent monsoon cloud cover in Northeast India through radar (SAR) backscatter analysis.

---

## 2. Core Rules & Requirements

1. **All-Weather Radar vs. Optical Imagery**:
   - **Cloud-Cover Limitation**: In Northeast India during the monsoon (June–September), optical cloud cover exceeds 80%. Never rely exclusively on optical sensors (Sentinel-2, Landsat) for emergency response.
   - **Sentinel-1 SAR (Synthetic Aperture Radar)**: Use C-band SAR (interferometric wide swath IW, GRD product). Radar waves penetrate clouds, rain, and haze day and night.
   - **Backscatter Water Physics**: Smooth standing water acts as a specular reflector, bouncing radar pulses away from the sensor. Water appears as very dark pixels (low backscatter: sigma_0_VV <= -16 dB, sigma_0_VH <= -22 dB).
   - **Rough / Vegetated Ground**: Mountain forests and urban structures create diffuse or double-bounce scattering (high backscatter: sigma_0 > -10 dB).

2. **Flood Extraction Algorithms**:
   - **Radiometric Calibration & Filtering**: Convert digital numbers to decibel backscatter:
     sigma_0_dB = 10 * log10(sigma_0)
   - Apply a 7x7 Lee Speckle Filter or Refined Lee Filter to eliminate radar grain noise.
   - **Bimodal Otsu Thresholding**: Calculate automated histogram threshold dividing water from non-water pixels.
   - **Change Detection (Difference Ratio)**: Compute change ratio against a dry-season baseline image:
     Delta_sigma = sigma_0_event_dB - sigma_0_baseline_dB
     Flood pixels are flagged where Delta_sigma <= -4.5 dB.

3. **Optical Water Detection (NDWI / MNDWI)**:
   - When cloud-free optical scenes are available (cloud cover <= 20%), calculate Normalized Difference Water Index:
     NDWI = (Green - NIR) / (Green + NIR) = (Band 3 - Band 8) / (Band 3 + Band 8)
     MNDWI = (Green - SWIR) / (Green + SWIR) = (Band 3 - Band 11) / (Band 3 + Band 11)
   - Water threshold: MNDWI > 0.0 to 0.15.

4. **Landslide Scar Detection (dNDVI + Terrain Slope)**:
   - Calculate differenced NDVI across pre-event and post-event images:
     dNDVI = NDVI_pre - NDVI_post
   - High vegetative loss (dNDVI > 0.30) intersecting slopes >= 20 degrees flags fresh landslide scars.

5. **Exclusion Masks (Permanent Water & Mountain Shadow)**:
   - Always mask out permanent water bodies (e.g. Brahmaputra dry channel, perennial lakes) so only *excess flood water* is flagged.
   - Mask steep radar terrain shadows (layover/shadow masks using DEM view angle) to prevent shadow misclassification as water.

---

## 3. Required Technologies & Libraries
- **Raster Processing**: `rasterio>=1.3.0`, `numpy>=1.26.0`, `scipy>=1.13.0`
- **Multi-Dimensional Earth Data**: `xarray>=2024.0.0`, `rioxarray>=0.15.0`
- **SpatioTemporal Asset Catalog (STAC)**: `pystac-client>=0.7.0`, `planetary-computer>=1.0.0`
- **Vector & Geometry Conversion**: `shapely>=2.0.0`, `geopandas>=1.0.0`

---

## 4. Implementation Guidance for SmartLogix

### SAR Otsu Water Segmentation Pipeline
```python
import numpy as np
import rasterio
from skimage.filters import threshold_otsu
from scipy.ndimage import uniform_filter

def extract_sar_flood_extent(sar_geotiff_path: str, baseline_water_mask_path: str) -> np.ndarray:
    with rasterio.open(sar_geotiff_path) as src:
        band = src.read(1).astype(np.float32)
        profile = src.profile
        
    # Convert linear power to dB backscatter
    valid_mask = band > 0
    band_db = np.full_like(band, -99.0)
    band_db[valid_mask] = 10.0 * np.log10(band[valid_mask] + 1e-6)
    
    # 5x5 speckle smoothing filter
    filtered_db = uniform_filter(band_db, size=5)
    
    # Restrict histogram to reasonable backscatter range [-30 dB, 0 dB]
    hist_pixels = filtered_db[(filtered_db >= -30.0) & (filtered_db <= 0.0)]
    otsu_thresh = threshold_otsu(hist_pixels)
    
    # Inundated surface: pixels below threshold
    raw_flood = (filtered_db < otsu_thresh) & (filtered_db > -35.0)
    
    # Subtract permanent riverbed
    with rasterio.open(baseline_water_mask_path) as base_src:
        permanent_water = base_src.read(1) > 0
        
    actual_flood = raw_flood & (~permanent_water)
    return actual_flood.astype(np.uint8)
```

---

## 5. Validation & Testing Requirements
- **Permanent Water Masking**: Verify that dry-season Brahmaputra water bodies are not reported as new flood events.
- **Histogram Inversion Check**: Assert that the lowest backscatter quantile aligns with verified water bodies.
- **Vector Polygonization**: Ensure flood raster masks convert to valid WGS84 GeoJSON polygons via `rasterio.features.shapes`.
- **Cloud-Cover Rejection**: Verify that optical scenes with cloud cover > 25% are rejected in favor of Sentinel-1 radar scenes.

---

## 6. Integration Guidance
- Feeds polygon flood extents into `.agent/skills/geospatial-gis-engine` for road intersection checks.
- Provides ground-truth labels for validating flood models in `.agent/skills/disaster-ml-prediction`.
