# AI Risk Engine Skill

## Purpose
Build the disaster prediction/risk layer for flood, landslide, severe weather, and related hazards.

## Rules
- Separate model inference from business rules.
- Validate all model inputs and outputs.
- Track model version and prediction timestamp.
- Preserve source and freshness of weather/sensor features.
- Produce risk score, category, confidence, hazard type, affected geography, and explanation metadata where supported.
- Never fabricate model output or present simulated data as live.
- Handle model failures gracefully and return a safe, explicit status.
- Do not silently use stale inputs.
- Keep thresholds configurable and documented.
- Store predictions for traceability.

## Architecture
External observations -> feature validation -> model inference -> confidence/risk score -> business thresholding -> PostGIS risk zone -> alert pipeline.

## Testing
Use deterministic fixtures and mocked models; test boundary thresholds, missing features, stale data, invalid outputs, and model failures.
