# ⚡ AI Revenue Recovery Platform (Track 03)
> **Razorpay Buildathon Track 03: AI Revenue Recovery**  
> *"Find revenue that's slipping away and win it back with bounded autonomous agents, stopping rules, and measured ROI."*

---

## 🏛️ End-to-End System Architecture

```
                    ┌──────────────────────────────┐
                    │        PAYMENT EVENTS        │
                    │                              │
                    │ • Payment Failed             │
                    │ • Checkout Abandoned         │
                    │ • Subscription Failed        │
                    │ • Invoice Overdue (B2B)      │
                    │ • Mandate Failed             │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │      EVENT / INTENT ROUTER   │
                    │                              │
                    │ Identify recovery scenario   │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
              ┌────────────────────────────────────────┐
              │          REVENUE RISK AGENT            │
              │                                        │
              │ • Revenue at Risk (₹)                  │
              │ • Customer Payment History Score       │
              │ • Failure Pattern & Recovery Prob      │
              └───────────────────┬────────────────────┘
                                  │
                                  ▼
              ┌────────────────────────────────────────┐
              │          DIAGNOSIS AGENT               │
              │                                        │
              │ "Why is this revenue at risk?"         │
              │ • 3DS Authentication OTP Friction      │
              │ • Soft Bank Issuer Decline             │
              │ • Overdue Invoice Age > 15 Days        │
              │ • Primary Gateway Switch Outage        │
              └───────────────────┬────────────────────┘
                                  │
                                  ▼
              ┌────────────────────────────────────────┐
              │        RECOVERY DECISION AGENT         │
              │                                        │
              │ Propose Optimal Intervention:          │
              │ • Smart Retry (Off-Peak)               │
              │ • Dynamic 1-Click Payment Link (+5%)   │
              │ • Hinglish Voice Chaser                │
              │ • Promise-to-Pay Installment Plan      │
              │ • Escalation to Human Specialist       │
              └───────────────────┬────────────────────┘
                                  │
                                  ▼
              ┌────────────────────────────────────────┐
              │       GOVERNANCE & POLICY ENGINE       │
              │         (BOUNDED AUTONOMY)             │
              │                                        │
              │ ✓ Max Retry Count (<= 3 Retries)       │
              │ ✓ Fraud Lockout (Suspended Status)     │
              │ ✓ Impulse Discount Cap (<= 15%)        │
              │ ✓ B2B Compliance Cap (<= ₹5,00,000)    │
              │ ✓ Card Block Mandate Lockout           │
              └───────────────────┬────────────────────┘
                                  │
                       ┌──────────┴──────────┐
                       │                     │
                    ALLOW                  DENY / ESCALATE
                       │                     │
                       ▼                     ▼
          ┌──────────────────────┐      ┌──────────────┐
          │  RECOVERY EXECUTOR   │      │ HUMAN REVIEW │
          │                      │      │    PORTAL    │
          │ • Dispatches Link    │      └──────────────┘
          │ • Hinglish Voice Bot │
          │ • Gateway Reroute    │
          │ • Mandate Sequence   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌────────────────────────┐
          │     PAYMENT RESULT     │
          │                        │
          │ SUCCESS → Recovered 💰 │
          │ FAILED  → Check Stops  │
          └───────────┬────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │   RECOVERY MONITOR     │
          │                        │
          │ • Track retry attempts │
          │ • Track promise date   │
          │ • Apply stopping rules │
          └───────────┬────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │      AUDIT TRAIL       │
          │                        │
          │ What happened?         │
          │ Why did AI decide?     │
          │ Policy applied?        │
          │ Measured ₹ Recovered?  │
          └───────────┬────────────┘
                      │
                      ▼
          ┌────────────────────────┐
          │     DASHBOARD 📊       │
          │                        │
          │ Revenue at Risk (₹)    │
          │ Revenue Recovered (₹)  │
          │ Recovery Rate (%)      │
          │ Batch AI Runner        │
          │ Hinglish Voice Lab     │
          └────────────────────────┘
```

---

## ⭐ Key Differentiators

1. **The Bounded Autonomy Guardrail**: The LLM *never* directly controls financial debits or unrestrained communication. Instead:
   $$\text{LLM} \longrightarrow \text{Suggest Action} \longrightarrow \text{Governance Engine (Deterministic Rules)} \longrightarrow \text{Validate} \longrightarrow \text{Execute Tool}$$
2. **Strict Stopping Rules Enforced**:
   - **`POLICY_HARD_STOP_MAX_RETRIES`**: Hard stop after 3 failed attempts to prevent customer fatigue and debt collection violations.
   - **`POLICY_HARD_STOP_SUSPENDED`**: Fraud lockout immediately terminates automated recovery if the customer account is suspended.
   - **`POLICY_CHECKOUT_DISCOUNT_CAP`**: Caps automated dynamic impulse discounts at 15% to prevent margin erosion.
   - **`POLICY_B2B_COMPLIANCE_CAP`**: Automatically escalates high-value overdue receivables exceeding ₹5,00,000 to Senior Relationship Managers.
3. **Multi-Channel Interventions**:
   - **1-Click WhatsApp Links**: With personalized 5% instant impulse waivers for checkout drop-offs.
   - **Hinglish Conversational Voice Agent**: Courteous voice reminders with structured 2-step **Promise-to-Pay (PTP)** installment plans.
   - **Smart Mandate Retry Sequencer**: Zero-touch card token update links scheduled for off-peak bank processing windows (04:00 AM IST).
   - **Dynamic Gateway Switch Failover**: Auto-rerouting payments from degraded network switches to low-latency fallback acquirers.
4. **Measured Financial Impact**:
   - Out of **₹10,86,390** total revenue at risk across 7 diverse scenarios, the system recovers **₹3,46,695.50** autonomously while cleanly stopping 1 fraudulent retry and escalating 1 enterprise invoice.

---

## 🛠️ Quick Start Guide

### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/](http://localhost:8000/)

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📑 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/recovery/items` | List all revenue at risk items with category & status filters |
| `POST` | `/api/recovery/execute/{item_id}` | Execute single-case AI recovery workflow with diagnosis trace |
| `POST` | `/api/recovery/batch` | Execute batch AI recovery across all pending items with measured ROI |
| `POST` | `/api/recovery/promise-to-pay` | Record structured Promise-to-Pay installment agreement |
| `GET` | `/api/recovery/metrics` | Retrieve aggregate ₹ revenue at risk, recovered, and recovery rate % |
| `POST` | `/api/recovery/reset` | Reset demo database to initial state for live demos |
| `POST` | `/chat/message` | Conversational multi-agent assistant with governance validation |
| `GET` | `/governance/audit-logs` | Immutable audit trail of every governance decision and reasoning trace |
| `GET` | `/governance/escalations` | Human specialist queue for complex B2B receivables and high risk cases |
