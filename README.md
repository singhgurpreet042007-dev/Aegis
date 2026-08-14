# 🛡️ AegisAI — Zero-Trust Behavioral Security Platform

> **Real-Time Behavioral Biometrics, Adaptive AI Risk Scoring & Zero-Trust Threat Mitigation Engine.**

[![CI](https://github.com/aegis-ai/aegis-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/aegis-ai/aegis-ai/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)

---

## ⚡ Core Features (Behavioral Biometrics Core Module)

AegisAI goes beyond static website audits to provide real-time behavioral biometric tracking, adaptive ML anomaly detection, and automated threat mitigation:

### 1. Live Behavioral Tracking & 60-Second Baseline Calibration
- **Lightweight Telemetry Tracker**: Captures throttled `mousemove` vectors ($50-100\text{ms}$), keypress dwell times, and flight latency jitter over WebSockets.
- **60-Second Calibration Mode**: Dedicated enrolment mode allowing users to record their natural typing rhythm and cursor curvature into a PostgreSQL `BehavioralBaseline` DB record.
- **Zero Mock Policy**: Displays `"No baseline yet — run calibration"` when uncalibrated, with zero hardcoded default numbers.

### 2. Real-Time Risk Score Engine
- **Z-Score & IsolationForest Pipeline**: Computes $z = \frac{|\text{cur} - \text{baseline\_mean}|}{\text{baseline\_std}}$ alongside IsolationForest trees on active session telemetry.
- **PostgreSQL Assessment Storage**: Saves every assessment as a `RiskAssessment` DB record.
- **Live WebSocket Gauge**: Streams real-time risk updates (`risk_score_update`) to dynamically update UI risk meters (Green $<30\%$, Yellow $30-70\%$, Red $>70\%$).

### 3. Authentic Bot Attack Simulator
- **Programmatic Bot Dispatcher**: Dispatches synthetic straight diagonal $16\text{ms}$ mouse vectors and $10\text{ms}$ zero-jitter keypresses through the exact same WebSocket pipeline as real users.
- **Organic Anomaly Spikes**: Robotic straightness (index $= 1.0$) and zero jitter cause $Z$-scores to spike ($>0.85$), turning the Risk Gauge RED organically.

### 4. Explainable AI (SHAP XAI) Panel
- **Feature Attribution Breakdown**: Computes feature importance weights for robotic linearity, dwell shifts, and flight jitter.
- **DB-Backed Attribution Reports**: Reads attributions directly from `RiskAssessment.explainableFactors` DB JSON.

### 5. Session Mouse Path Canvas Visualization
- **Raw Coordinate Storage**: Stores raw $(x, y, t)$ coordinates in `BehavioralSession.mousePoints` in PostgreSQL.
- **Side-by-Side Canvas Visualizer**: Renders smooth green curved arcs for human sessions vs rigid red diagonal lines for bot attacks side-by-side.

---

## 💻 Developer SDK & Integration Guide

### 1. One-Line Script Tag Integration (HTML / Web Apps)
Embed this lightweight script tag inside your web application's `<head>` tag:

```html
<script src="http://localhost:3001/aegis-tracker.js" data-site-id="aegis_site_prod_99182" async></script>
```

### 2. React / Next.js SDK Integration
Import and initialize the `globalTelemetryTracker` in your application root:

```typescript
import { globalTelemetryTracker } from '@/lib/telemetry-tracker';

// Initialize session tracking
globalTelemetryTracker.init({
  userId: 'usr_active_email@domain.com',
  sessionId: 'sess_live_991',
});

// Trigger Red Team Bot Attack Simulation programmatically
globalTelemetryTracker.simulateBotAttackBatch({
  pointCount: 50,
  startX: 80,
  startY: 80,
});
```

---

## 🏗️ Architecture

AegisAI is built as a Turborepo monorepo:

| Package | Stack | Description |
| :--- | :--- | :--- |
| `frontend/` | Next.js 15, React 19, Tailwind CSS | Real-Time SecOps Dashboard & Client SDK |
| `backend/` | NestJS 10, Socket.io, Prisma 5, PostgreSQL | REST APIs & WebSocket Gateway |
| `ai-risk-engine/` | Python, IsolationForest, SHAP | ML Anomaly Scoring Microservice |
| `database/` | Prisma, PostgreSQL 16 | Relational DB Schema (`BehavioralBaseline`, `RiskAssessment`, `SecurityIncident`) |
| `shared/` | TypeScript | Shared Types, DTOs, & Enums |

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/aegis-ai/aegis-ai.git
cd aegis-ai

# Start backend NestJS server (Port 3000)
cd backend && npm run dev

# Start frontend Next.js server (Port 3001)
cd frontend && npm run dev
```

- **Dashboard**: [http://localhost:3001/dashboard](http://localhost:3001/dashboard)
- **Backend Swagger API Docs**: [http://localhost:3000/api](http://localhost:3000/api)
