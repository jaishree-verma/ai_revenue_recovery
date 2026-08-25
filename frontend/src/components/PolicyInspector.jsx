import React from 'react';
import { SlidersHorizontal, Shield, Lock, AlertCircle, FileCheck, CheckCircle2, ShieldAlert, Sparkles, OctagonX } from 'lucide-react';

export default function PolicyInspector() {
  const stoppingRules = [
    {
      id: 'POLICY_HARD_STOP_MAX_RETRIES',
      category: 'Bounded Autonomy • Stopping Rules',
      name: 'Maximum Retry Threshold (3 Retries)',
      description: 'Prevents customer spamming and harassment. Ceases all automated recovery actions when retry_count >= 3.',
      condition: 'risk_item.retry_count >= risk_item.max_retries',
      outcome: 'HARD STOP (Cease Autonomous Recovery)',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30'
    },
    {
      id: 'POLICY_HARD_STOP_SUSPENDED',
      category: 'Security & Fraud Guardrail',
      name: 'Account Fraud / Suspension Lockout',
      description: 'Immediately terminates all automated revenue recovery if the target account has been marked SUSPENDED or flagged for fraud.',
      condition: 'customer.account_status == "SUSPENDED"',
      outcome: 'HARD STOP (Fraud Lockout)',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30'
    },
    {
      id: 'POLICY_CHECKOUT_DISCOUNT_CAP',
      category: 'Discount & Impulse Cap',
      name: 'Maximum 15% Checkout Impulse Waiver',
      description: 'Limits AI autonomous discounting. Impulse recovery offers on abandoned carts cannot exceed 15% of cart value.',
      condition: 'offered_discount_pct <= 15.0%',
      outcome: 'DENY if discount > 15%',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'POLICY_B2B_COMPLIANCE_CAP',
      category: 'High-Value Escalation',
      name: 'B2B Autonomous Threshold (₹5,00,000 Cap)',
      description: 'Overdue B2B invoices exceeding ₹5,00,000 are not eligible for autonomous resolution; requires mandatory Human Review.',
      condition: 'risk_item.amount_at_risk <= ₹5,00,000',
      outcome: 'ESCALATE to Senior Finance Manager',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      id: 'POLICY_MANDATE_CARD_BLOCKED',
      category: 'Mandate Sequencer Rule',
      name: 'Blocked Card Lockout for Recurring Mandates',
      description: 'Cancels scheduled subscription auto-debit retries if the associated card is BLOCKED to prevent fee accumulation.',
      condition: 'card.card_status != "BLOCKED"',
      outcome: 'HARD STOP if card is BLOCKED',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    {
      id: 'POLICY_PAYMENT_DEGRADATION_ALLOW',
      category: 'Gateway Rerouting Rule',
      name: 'Dynamic Gateway Switch Authorization',
      description: 'Authorizes autonomous reroute of degraded transaction flows when primary acquirer switch success rate drops below 50%.',
      condition: 'primary_switch_latency > 2000ms OR success_rate < 50%',
      outcome: 'ALLOW Secondary Gateway Reroute',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
  ];

  const riskWeights = [
    { factor: 'Customer Payment History Score', weight: '35%', detail: 'Scores below 60 add +35 risk points' },
    { factor: 'Prior Failed Retry Count', weight: '25%', detail: '2 prior retries add +25 risk points' },
    { factor: 'Account Status & Tenure', weight: '20%', detail: 'Suspended accounts add +50 points (Critical lockout)' },
    { factor: 'Transaction / Invoice Exposure Ratio', weight: '20%', detail: 'Amount > ₹5,00,000 triggers mandatory escalation' }
  ];

  const riskTiers = [
    { tier: 'LOW (0 - 30)', action: 'ALLOW Full Autonomous Recovery', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { tier: 'MEDIUM (31 - 50)', action: 'ALLOW with Bounded Constraints', color: 'text-white bg-slate-900 border-slate-700' },
    { tier: 'HIGH (51 - 75)', action: 'ESCALATE to Human Recovery Specialist', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { tier: 'CRITICAL (76 - 100)', action: 'HARD STOP / DENY All Actions', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
          Governance Stopping Rules &amp; Bounded Autonomy Matrix
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 font-medium">
          The core differentiator: AI proposes interventions, but the deterministic Policy Engine strictly enforces stopping rules and compliance caps.
        </p>
      </div>

      {/* Stopping Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stoppingRules.map(p => (
          <div key={p.id} className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${p.badgeColor}`}>
                  {p.id}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{p.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{p.description}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
                {p.condition}
              </div>
              <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono">
                <span>Verdict:</span>
                <span className="text-white font-bold">{p.outcome}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Scoring & Tier Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Weights (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Revenue Risk Calculation Formula
          </h3>

          <div className="space-y-2.5">
            {riskWeights.map((w, i) => (
              <div key={i} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{w.factor}</span>
                  <span className="text-[11px] text-slate-400">{w.detail}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{w.weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Tiers (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Governance Decision Tier Matrix
          </h3>

          <div className="space-y-2.5">
            {riskTiers.map((t, i) => (
              <div key={i} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${t.color}`}>
                <span className="font-bold font-mono text-xs">{t.tier}</span>
                <span className="font-bold uppercase tracking-wider text-[11px]">{t.action}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
