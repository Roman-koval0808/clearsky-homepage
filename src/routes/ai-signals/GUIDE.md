# ClearSky AI Signals · User Guide

Welcome to the AI Signals prototype. This guide explains how to use the simulation environment to test the "Deterministic Control + AI Enrichment" pipeline.

## 🚀 Getting Started

### 1. Run a Simulation

Go to https://clearskysoftware.net/ai-signals/extract or Navigate to the **Simulation Tool** (the "Run Simulations" button at the bottom of the dashboard).

- **Pick a Mock Signal**: Select one of the incoming signals (e.g., "Telnyx Voice: urgent voicemail").
- **Run Extraction**: Click the **Run Extraction** button.
- **Wait for Success**: Once the AI finishes analyzing the text, the dashboard in your other tab will update automatically.

### 2. The Dashboard Pipeline

The dashboard reflects the strict three-stage pipeline defined in the technical specification:

- **STAGE 1: Event Feed & AI Enrichment**
  - The **Event Feed** shows the raw normalized stream.
  - The **Intelligence Enrichment** card shows what the AI _extracted_ (Sentiment, Intent, Summary).
  - _Rule:_ AI only reads context; it does not decide what happens next.

- **STAGE 2: Signal Detection**
  - The **AI Signals Detected** boxes show deterministic "Signal Candidates."
  - _How it works:_ A rules engine looks at the AI's extraction. If it sees a complaint, it fires a **Bottleneck** signal. If urgency is high, it fires a **Risk** signal.
  - **Filter Tip:** Click any signal box (e.g., "Risk") to filter the feed and see only related items.

- **STAGE 3: Orchestrator & Action Queue**
  - The **Action Queue** shows what the **Orchestrator** decided to do.
  - _Strict Actions:_ Every action has a formal ID (e.g., `ACT-REV-001`).
  - _Execution Modes:_ High-priority actions default to **M. Override** (Manual), while routine tasks are marked as **Auto-API**.

---

## 🛠️ Advanced Features

### Multiple Approvals

If the Orchestrator queues multiple manual tasks, use the **Prev / Next** arrows on the **Approvals Pending** card to cycle through them.

### Real-Time Sync

If you have the Dashboard and the Simulation Tool open in two side-by-side windows, the Dashboard will update the moment the simulation finishes—no refresh required.

### Resetting Data

To clear your simulation history and start fresh, click the **"Reset Local Data"** link at the bottom of the dashboard.

---

_Built with Svelte 5 for ClearSky Software._
