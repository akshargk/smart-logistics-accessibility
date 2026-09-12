---
name: hydrological-time-series
description: River gauge telemetry forecasting, flash-flood lead-time prediction (3-12h), rainfall-runoff modeling, and recurrent neural network architectures.
---

# Hydrological Time-Series Forecasting Skill

## 1. Purpose
Forecast downstream river stage levels, discharge rates, and flash flood surges across Northeast India river networks (Brahmaputra, Barak, Subansiri, Teesta). Delivers 3 to 12 hours of actionable lead time to evacuate riverfront settlements and reroute highway convoys.

---

## 2. Core Rules & Requirements

1. **Lead-Time Windows & Horizons**:
   - Generate multi-step recursive or direct forecasts at discrete horizons:
     - t + 3h: Immediate flash flood warning for mountain gorges.
     - t + 6h: Riverbank breach forecasting for valley corridors.
     - t + 12h: Regional flood crest forecasting for major floodplains.

2. **Rainfall-Runoff Mechanics & Hydrographs**:
   - Model the hydrograph convolution between upstream basin precipitation P(t) and downstream river discharge Q(t):
     Q(t) = integral_0^t P(tau) * U(t - tau) dtau
   - Factor in terrain lag time tau_lag, basin saturation, and dam upstream spillway discharge reports from the Central Water Commission (CWC).

3. **Temporal Leakage Prevention (Strict Time-Series Split)**:
   - NEVER use random train/test splitting or future lookahead.
   - Use **Expanding Window** or **Purged Walk-Forward Cross-Validation**.
   - Strip all target lag features from the immediate forecast window to prevent autocorrelation leakage.

4. **Model Architecture Hierarchy**:
   - **Baseline Benchmark**: Fast statistical autoregression (`StatsForecast`: AutoARIMA, Theta, AutoETS) for immediate baseline validation.
   - **Deep Sequence Models**: **1D CNN-LSTM** or **GRU** (Gated Recurrent Unit) models with attention heads:
     - 1D CNN extracts local temporal precipitation burst patterns.
     - LSTM/GRU models long-term antecedent soil saturation and snowmelt trends.

5. **Hydrological Evaluation Metrics**:
   - Never rely on Mean Absolute Error (MAE) alone; evaluate hydrologically:
     - **Nash-Sutcliffe Efficiency (NSE)**: Must achieve NSE >= 0.75 for operational release:
       NSE = 1 - [ sum(Q_obs - Q_sim)^2 / sum(Q_obs - mean(Q_obs))^2 ]
     - **Kling-Gupta Efficiency (KGE)**: Evaluates correlation, bias, and variability.
     - **Peak Timing Error**: Delta_t_peak <= 1.0 hour.

6. **CWC Gauge Level Classification**:
   - Compare predicted river stage against official Central Water Commission thresholds:
     - Stage < Warning Level: `NORMAL`
     - Warning Level <= Stage < Danger Level: `WARNING`
     - Danger Level <= Stage < Highest Flood Level (HFL): `DANGER`
     - Stage >= Highest Flood Level: `CATASTROPHIC_RECORD_BREACH`

---

## 3. Required Technologies & Libraries
- **Deep Learning**: `torch>=2.0.0`
- **Time-Series Frameworks**: `darts>=0.30.0` or `statsforecast>=1.7.0`
- **Numerical & Data**: `numpy>=1.26.0`, `pandas>=2.2.0`, `scipy>=1.13.0`
- **Model Storage**: `joblib>=1.4.0`

---

## 4. Implementation Guidance for SmartLogix

### PyTorch GRU Hydrograph Forecaster Structure
```python
import torch
import torch.nn as nn

class HydroGRUForecaster(nn.Module):
    def __init__(self, input_features: int = 5, hidden_dim: int = 64, num_layers: int = 2, forecast_steps: int = 3):
        super().__init__()
        # 1D Convolution over input time-steps (e.g. 72 hours of telemetry)
        self.conv1d = nn.Conv1d(in_channels=input_features, out_channels=32, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        # Recurrent GRU
        self.gru = nn.GRU(input_size=32, hidden_size=hidden_dim, num_layers=num_layers, batch_first=True, dropout=0.2)
        # Output multi-step forecast (e.g. [t+3h, t+6h, t+12h])
        self.fc = nn.Linear(hidden_dim, forecast_steps)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [batch, seq_len, features] -> transpose for Conv1d: [batch, features, seq_len]
        conv_out = self.relu(self.conv1d(x.transpose(1, 2)))
        gru_in = conv_out.transpose(1, 2)
        gru_out, _ = self.gru(gru_in)
        # Take last time-step hidden representation
        last_hidden = gru_out[:, -1, :]
        return self.fc(last_hidden)
```

---

## 5. Validation & Testing Requirements
- **Historical Benchmark Holdout**: Test models against the 2022 Barak river swell at Annapurna Ghat (Silchar); assert NSE >= 0.78.
- **Peak Lag Test**: Verify that sudden simulated cloudburst upstream (80mm in 2h) reflects downstream within known basin transit time (+4 to +6 hours).
- **Physical Monotonicity**: Increasing upstream dam discharge must monotonically increase predicted downstream water stage.

---

## 6. Integration Guidance
- Ingests river gauge telemetry and radar rainfall from `.agent/skills/disaster-data-ingestion`.
- Outputs flood stage alerts to `.agent/skills/cap-emergency-alerts` and flood water boundaries to `.agent/skills/geospatial-gis-engine`.
