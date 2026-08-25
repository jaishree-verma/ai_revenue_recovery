import React from 'react';
import { 
  Zap, 
  Search, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw, 
  TrendingUp,
  FileText,
  ArrowRight
} from 'lucide-react';

export default function MultiAgentVisualizer({ activeTrace }) {
  const steps = [
    {
      id: 1,
      name: '1. Event Ingestion',
      subtitle: 'Webhook / Trigger',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      activeColor: 'ring-amber-400 bg-amber-500/20 text-amber-300',
      desc: 'Checkout Drop, Sub Fail, B2B Overdue'
    },
    {
      id: 2,
      name: '2. Intent Router',
      subtitle: 'Classification',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      activeColor: 'ring-blue-400 bg-blue-500/20 text-blue-300',
      desc: 'Categorizes recovery workflow'
    },
    {
      id: 3,
      name: '3. Risk Agent',
      subtitle: 'Score 0–100',
      icon: ShieldAlert,
      color: 'from-purple-500 to-indigo-500',
      activeColor: 'ring-purple-400 bg-purple-500/20 text-purple-300',
      desc: 'Calculates ₹ at risk & history score'
    },
    {
      id: 4,
      name: '4. Diagnosis Agent',
      subtitle: 'Root Cause',
      icon: HelpCircle,
      color: 'from-pink-500 to-rose-500',
      activeColor: 'ring-pink-400 bg-pink-500/20 text-pink-300',
      desc: 'Answers: "Why is revenue at risk?"'
    },
    {
      id: 5,
      name: '5. Decision Agent',
      subtitle: 'Intervention',
      icon: CheckCircle2,
      color: 'from-teal-500 to-emerald-500',
      activeColor: 'ring-teal-400 bg-teal-500/20 text-teal-300',
      desc: 'Proposes retry, link, voice, or PTP'
    },
    {
      id: 6,
      name: '6. Governance & Policy',
      subtitle: 'Bounded Autonomy',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-green-600',
      activeColor: 'ring-emerald-400 bg-emerald-500/20 text-emerald-300',
      desc: 'Enforces stopping rules & discount cap'
    },
    {
      id: 7,
      name: '7. Recovered ₹ & Audit',
      subtitle: 'Execution Trace',
      icon: TrendingUp,
      color: 'from-yellow-400 to-amber-500',
      activeColor: 'ring-yellow-400 bg-yellow-500/20 text-yellow-300',
      desc: 'Measures ₹ & writes immutable log'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Multi-Agent Autonomous Pipeline Architecture
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
            Strict separation of concerns: LLM proposes interventions &rarr; Governance Engine strictly validates stopping rules.
          </p>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-mono text-slate-300 font-bold">
          Bounded Autonomy Pattern
        </span>
      </div>

      {/* Grid of 7 Pipeline Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.id}
              className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                activeTrace 
                  ? 'bg-slate-800/90 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-md'
                  : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${s.color} text-slate-950 font-black shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">#{s.id}</span>
                </div>
                <div className="text-xs font-bold text-white leading-tight">{s.name}</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">{s.subtitle}</div>
              </div>

              <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60 leading-snug">
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Single Execution Trace Drawer if triggered */}
      {activeTrace && activeTrace.agent_result && (
        <div className="mt-4 p-4 bg-slate-950/80 border border-emerald-500/30 rounded-xl font-mono text-xs text-slate-200">
          <div className="flex items-center justify-between text-emerald-400 font-bold mb-2 pb-1 border-b border-slate-800">
            <span>⚡ LIVE AI REASONING TRACE (CASE #{activeTrace.item?.id} - {activeTrace.item?.title})</span>
            <span>STATUS: {activeTrace.item?.status}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">🔍 Diagnosis Agent Findings:</span>
              <p className="text-slate-300">
                {activeTrace.agent_result.diagnosis?.diagnosis_summary || activeTrace.item?.failure_reason}
              </p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-blue-400 font-bold block mb-1">🛡️ Governance Decision & Policy:</span>
              <p className="text-slate-300">
                Policy: <span className="font-mono text-white">{activeTrace.agent_result.governance_decision?.policy_applied}</span> | 
                Verdict: <span className="font-bold text-emerald-400">{activeTrace.agent_result.governance_decision?.decision}</span>
              </p>
              <p className="text-emerald-400 font-bold mt-1">
                Measured Recovered: ₹{activeTrace.item?.amount_recovered?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
