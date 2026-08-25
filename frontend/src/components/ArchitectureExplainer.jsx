import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  Layers, 
  Lock, 
  AlertTriangle, 
  DollarSign, 
  Cpu, 
  BookOpen, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ARCHITECTURE_STEPS = [
  {
    step: 1,
    title: 'PAYMENT EVENTS INGESTION',
    badge: 'Stage 1 • Event Layer',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/40',
    summary: 'Captures revenue loss triggers across checkout, subscriptions, mandates, and invoices.',
    whatItDoes: 'Ingests real-time webhook payloads and database event triggers whenever revenue begins slipping away.',
    technicalDetails: [
      'Checkout Abandonment: Cart exit during 3DS OTP verification or UPI intent screen.',
      'Subscription Mandate Soft Decline: Recurring auto-debit failure due to card expiry or bank limits.',
      'B2B Overdue Invoice: Accounts receivable exceeding payment credit terms (e.g. Net 15/30/45).',
      'Payment Gateway Degradation: Latency spikes (>2000ms) or bank core switch failure.'
    ],
    whyItMatters: 'Revenue loss rarely happens in one clean step. Catching it at the exact point of degradation is the first step toward winning it back.'
  },
  {
    step: 2,
    title: 'EVENT / INTENT ROUTER',
    badge: 'Stage 2 • Routing Layer',
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/40',
    summary: 'Classifies incoming signals into discrete recovery workflows and intents.',
    whatItDoes: 'Analyzes the event type or customer message and maps it to the precise recovery intent (`checkout_recovery`, `mandate_sequencer`, `b2b_receivables_chaser`, `payment_degradation_fix`).',
    technicalDetails: [
      'Normalizes unstructured event payloads into standardized `GovernanceRequest` contracts.',
      'Extracts customer identity, invoice identifier, amount at risk, and payment channel.',
      'Ensures every incoming request is tagged with an immutable session ID for tracing.'
    ],
    whyItMatters: 'Guarantees that distinct failure types (e.g. a high-touch B2B overdue invoice vs. a fast-moving e-commerce cart drop) receive targeted, specialized handling.'
  },
  {
    step: 3,
    title: 'REVENUE RISK AGENT',
    badge: 'Stage 3 • Risk Engine',
    icon: ShieldAlert,
    color: 'from-purple-500 to-indigo-500',
    borderColor: 'border-purple-500/40',
    summary: 'Quantifies revenue at risk (₹), assesses customer history, and computes risk score.',
    whatItDoes: 'Calculates the total monetary exposure, inspects the customer’s historical payment score (0–100), evaluates prior retry attempts, and computes recovery probability %.',
    technicalDetails: [
      'Risk Score Formula: Weighted sum of payment history (35%), prior failed retries (25%), account tenure (20%), and exposure ratio (20%).',
      'Risk Tiers: LOW (0–30), MEDIUM (31–50), HIGH (51–75 &rarr; Escalate), CRITICAL (76–100 &rarr; Hard Stop).',
      'Recovery Probability: Machine-estimated likelihood of winning the revenue back based on customer tier.'
    ],
    whyItMatters: 'Prevents wasteful recovery efforts on bad-debt accounts while prioritizing high-probability, high-value recoveries.'
  },
  {
    step: 4,
    title: 'DIAGNOSIS AGENT',
    badge: 'Stage 4 • Diagnostic AI',
    icon: HelpCircle,
    color: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-500/40',
    summary: 'Answers the core question: "Why is this revenue at risk?"',
    whatItDoes: 'Performs deep forensic analysis on the root cause—distinguishing between technical frictions (OTP timeouts), issuer policies (card expiration), cash flow delays, and infrastructure outages.',
    technicalDetails: [
      'Diagnoses 3DS OTP friction & latency spikes during bank redirect.',
      'Identifies soft issuer decline codes (`DO_NOT_HONOR_SOFT_RETRY`, `EXPIRED_CARD_TOKEN`).',
      'Detects acquiring bank primary switch health degradation and recommends dynamic fallback routing.',
      'Assesses invoice aging tiers (Tier 1: <15 days, Tier 2: 15–30 days, Tier 3: >45 days).'
    ],
    whyItMatters: 'Without diagnosis, AI makes blind guesses. Proper diagnosis enables tailored interventions that actually work.'
  },
  {
    step: 5,
    title: 'RECOVERY DECISION AGENT',
    badge: 'Stage 5 • Strategy Formulation',
    icon: CheckCircle2,
    color: 'from-teal-500 to-emerald-500',
    borderColor: 'border-teal-500/40',
    summary: 'Formulates the optimal intervention strategy & generates execution payloads.',
    whatItDoes: 'Decides the best recovery intervention (Smart Retry, Dynamic 1-Click Payment Link, Hinglish Voice Chaser, Promise-to-Pay Plan, or Human Escalation).',
    technicalDetails: [
      'Dynamic Payment Link: Generates a 1-click Razorpay link with 5% impulse waiver to close cart drops.',
      'Smart Mandate Sequencer: Schedules off-peak retries at 04:00 AM IST during high bank authorization windows.',
      'Hinglish Voice Bot: Generates conversational Hinglish dialogue scripts for courteous B2B overdue collections.',
      'Promise-to-Pay Plan: Generates 2-part installment agreements (50% upfront, balance in 14 days).'
    ],
    whyItMatters: 'Selects the right message, channel, and financial incentive tailored to the diagnosed root cause.'
  },
  {
    step: 6,
    title: 'GOVERNANCE & POLICY ENGINE (BOUNDED AUTONOMY)',
    badge: 'Stage 6 • The Core Guardrail ⭐',
    icon: ShieldCheck,
    color: 'from-emerald-400 to-teal-400',
    borderColor: 'border-emerald-500/60',
    summary: 'The critical security barrier: Strictly validates stopping rules and compliance caps.',
    whatItDoes: 'Ensures the AI LLM NEVER directly debits accounts or spams users. All proposed actions pass through deterministic, hard-coded stopping rules before execution.',
    technicalDetails: [
      'Stopping Rule 1 (Max Retries): Hard stop if `retry_count >= 3` to comply with debt collection standards.',
      'Stopping Rule 2 (Fraud Lockout): Hard stop if `account_status == "SUSPENDED"`.',
      'Stopping Rule 3 (Discount Cap): Denies discounts exceeding maximum allowable policy cap (15%).',
      'Stopping Rule 4 (B2B Compliance Threshold): Automatically escalates invoices > ₹5,00,000 to Senior Finance Managers.',
      'Stopping Rule 5 (Card Status): Blocks mandate retries on blocked cards.'
    ],
    whyItMatters: 'This is the strongest hackathon differentiator: bounded autonomy prevents runaway AI hallucinations, legal liabilities, and customer harassment.'
  },
  {
    step: 7,
    title: 'RECOVERY EXECUTOR & MONITOR',
    badge: 'Stage 7 • Execution & Tracking',
    icon: Play,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/40',
    summary: 'Dispatches approved interventions and tracks fulfillment, retries, and promise dates.',
    whatItDoes: 'Dispatches live payment links via WhatsApp/SMS, schedules off-peak mandate retries, switches gateway routes, and tracks Promise-to-Pay calendar fulfillment.',
    technicalDetails: [
      'Executes only ALLOW-verdict actions certified by the Governance Layer.',
      'Simulates Razorpay webhook confirmation upon customer payment completion.',
      'Monitors promise dates and flags overdue installments for automated follow-up.',
      'Enforces hard stops when maximum attempts are exhausted.'
    ],
    whyItMatters: 'Closes the loop from strategy to real-world execution and payment realization.'
  },
  {
    step: 8,
    title: 'PAYMENT RESULT & IMMUTABLE AUDIT TRAIL',
    badge: 'Stage 8 • Audit & Explainability',
    icon: TrendingUp,
    color: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-500/40',
    summary: 'Logs immutable explainability records and computes measured revenue recovered (₹).',
    whatItDoes: 'Records what happened, why AI decided, which policy was applied, whether stopping rules fired, and the exact amount of money recovered.',
    technicalDetails: [
      'Creates immutable `AuditLog` rows (insert-only, no modifications).',
      'Captures step-by-step reasoning traces for regulatory audits & SOC2 compliance.',
      'Computes measured revenue recovered: Net amount realized after dynamic waivers.',
      'Writes escalation tickets with conversation context for human agents.'
    ],
    whyItMatters: 'Provides 100% transparent auditability for enterprise finance controllers and compliance teams.'
  },
  {
    step: 9,
    title: 'REVENUE DASHBOARD & ROI MEASUREMENT',
    badge: 'Stage 9 • Analytics & Control',
    icon: BarChart3,
    color: 'from-emerald-500 to-cyan-500',
    borderColor: 'border-emerald-500/40',
    summary: 'Presents real-time ₹ recovery KPIs, batch controls, and interactive simulators.',
    whatItDoes: 'Displays total ₹ at risk vs. ₹ recovered, recovery rates, stopping rules enforced, and provides interactive tools for batch processing and case inspection.',
    technicalDetails: [
      'Real-time Financial KPI Cards: ₹ at Risk, ₹ Recovered, Recovery Rate %, Successful Recoveries.',
      'Batch AI Recovery Engine: One-click bounded execution across hundreds of cases.',
      'Interactive Hinglish Voice Simulator: Live audio and dialogue testbench.',
      'Human Review Queue: Portal for resolving high-value enterprise escalations.'
    ],
    whyItMatters: 'Demonstrates proven financial ROI and gives finance leaders total visibility and control.'
  }
];

export default function ArchitectureExplainer() {
  const [selectedStep, setSelectedStep] = useState(ARCHITECTURE_STEPS[5]); // Default to Governance (Core Differentiator)
  const [expandedAll, setExpandedAll] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel-glow p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-razor-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-razor-accent/10 border border-razor-accent/30 text-razor-accent text-xs font-mono font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full System Deep-Dive • Track 03</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              What Exactly Does Each Step Do?
            </h2>
            <p className="text-xs sm:text-sm text-razor-textMuted max-w-2xl mt-1">
              Explore the end-to-end multi-agent loop from payment failure detection to diagnostic reasoning, 
              bounded governance stopping rules, autonomous execution, and measured financial recovery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedAll(!expandedAll)}
              className="px-3.5 py-2 rounded-xl bg-razor-panel border border-razor-border hover:border-razor-accent/50 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-razor-accent" />
              <span>{expandedAll ? 'Show Step Selector' : 'View All Steps Expanded'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Architectural Step Navigator Tabs */}
      {!expandedAll && (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {ARCHITECTURE_STEPS.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedStep.step === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setSelectedStep(s)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-razor-panel border-razor-accent shadow-glow-emerald ring-1 ring-razor-accent/50'
                    : 'bg-razor-panel/70 border-razor-border hover:border-razor-borderLight hover:bg-razor-card'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${s.color} text-slate-950 font-black shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-razor-textDim">
                    #{s.step}
                  </span>
                </div>
                <div>
                  <div className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-razor-accent' : 'text-white'}`}>
                    {s.title.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-razor-textMuted truncate mt-0.5">
                    {s.badge.split('•')[1] || s.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Step Detailed Card or All Expanded */}
      {!expandedAll ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-razor-borderLight/80 shadow-2xl">
          
          {/* Top Stage Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-razor-border">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${selectedStep.color} text-slate-950 font-black shadow-lg`}>
                {React.createElement(selectedStep.icon, { className: "w-6 h-6" })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-razor-accent px-2 py-0.5 rounded-md bg-razor-accent/10 border border-razor-accent/20">
                    Step {selectedStep.step} of 9
                  </span>
                  <span className="text-xs font-mono text-razor-textDim font-bold">
                    {selectedStep.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {selectedStep.title}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-razor-textMuted block">Summary Goal</span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-400 font-sans">
                {selectedStep.summary}
              </span>
            </div>
          </div>

          {/* Body Description & Deep-Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* What It Does (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-razor-textMuted font-bold flex items-center gap-1.5 mb-2">
                  <Cpu className="w-3.5 h-3.5 text-razor-primary" />
                  What Exactly Happens in this Step?
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium bg-razor-bg/60 p-4 rounded-2xl border border-razor-border">
                  {selectedStep.whatItDoes}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-razor-textMuted font-bold flex items-center gap-1.5 mb-2">
                  <Layers className="w-3.5 h-3.5 text-razor-accent" />
                  Technical Implementation Details:
                </h4>
                <ul className="space-y-2 font-sans text-xs">
                  {selectedStep.technicalDetails.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-razor-panel/80 p-3 rounded-xl border border-razor-border text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-razor-accent mt-1.5 shrink-0"></span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Why It Matters & Hackathon Impact (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-razor-panel via-razor-card to-razor-panel p-5 rounded-2xl border border-razor-accent/30 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-razor-accent uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Why This Step Differentiates Your Project</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {selectedStep.whyItMatters}
                </p>
              </div>

              {/* Bounded Autonomy Guardrail Callout */}
              <div className="bg-razor-bg p-4 rounded-2xl border border-razor-border text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-razor-textMuted">
                  <span>ARCHITECTURE PRINCIPLE</span>
                  <span className="text-razor-accent font-bold">BOUNDED AUTONOMY</span>
                </div>
                <div className="p-2.5 bg-razor-panel rounded-xl text-[11px] text-emerald-300 font-sans border border-razor-border">
                  LLM proposes intervention &rarr; Deterministic Policy Engine strictly checks stopping rules &rarr; Tool executes only upon ALLOW.
                </div>
              </div>
            </div>

          </div>

          {/* Step Progression Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-razor-border">
            <button
              disabled={selectedStep.step === 1}
              onClick={() => setSelectedStep(ARCHITECTURE_STEPS[selectedStep.step - 2])}
              className="px-4 py-2 bg-razor-panel hover:bg-razor-card disabled:opacity-40 text-xs font-bold rounded-xl border border-razor-border text-slate-300 transition-all cursor-pointer"
            >
              &larr; Previous Step
            </button>
            <span className="text-xs font-mono text-razor-textDim">
              Step {selectedStep.step} of 9
            </span>
            <button
              disabled={selectedStep.step === ARCHITECTURE_STEPS.length}
              onClick={() => setSelectedStep(ARCHITECTURE_STEPS[selectedStep.step])}
              className="px-4 py-2 bg-razor-primary hover:bg-blue-500 disabled:opacity-40 text-xs font-bold rounded-xl text-white transition-all shadow-md cursor-pointer"
            >
              Next Step &rarr;
            </button>
          </div>

        </div>
      ) : (
        /* All Steps Expanded Layout */
        <div className="space-y-4">
          {ARCHITECTURE_STEPS.map((s) => (
            <div key={s.step} className="glass-panel p-5 rounded-2xl border border-razor-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${s.color} text-slate-950 font-black`}>
                    {React.createElement(s.icon, { className: "w-4 h-4" })}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-razor-accent font-bold block">{s.badge}</span>
                    <h4 className="text-sm font-bold text-white">Step {s.step}: {s.title}</h4>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold hidden sm:inline">{s.summary}</span>
              </div>
              <p className="text-xs text-slate-300 bg-razor-bg/60 p-3 rounded-xl border border-razor-border font-sans">
                {s.whatItDoes}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
