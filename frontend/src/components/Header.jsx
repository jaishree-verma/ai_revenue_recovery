import React from 'react';
import { 
  DollarSign, 
  ShieldCheck, 
  MessageSquare, 
  Sliders, 
  AlertTriangle, 
  UserCheck, 
  Sparkles,
  BarChart3,
  PhoneCall,
  Layers,
  BookOpen
} from 'lucide-react';

export const CUSTOMER_PERSONAS = [
  {
    id: 1,
    name: 'Priya Sharma',
    scenario: 'Checkout Abandonment (₹24.9k)',
    status: 'ACTIVE',
    riskTier: 'LOW',
    tag: 'Cart Drop-Off'
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    scenario: 'SaaS Mandate Retry (₹12.5k)',
    status: 'ACTIVE',
    riskTier: 'MEDIUM',
    tag: 'Subscription Fail'
  },
  {
    id: 3,
    name: 'Anita Kapoor',
    scenario: 'B2B Overdue Invoice (₹85.0k)',
    status: 'ACTIVE',
    riskTier: 'LOW',
    tag: 'Hinglish Chaser'
  },
  {
    id: 4,
    name: 'Vikramaditya Singh',
    scenario: 'Gateway Degradation (₹2.5L)',
    status: 'ACTIVE',
    riskTier: 'LOW',
    tag: 'Network Switch Outage'
  },
  {
    id: 5,
    name: 'Rohan Das',
    scenario: 'Fraud Lockout / Hard Stop (₹45.0k)',
    status: 'SUSPENDED',
    riskTier: 'CRITICAL',
    tag: 'Stopping Rule Cease'
  },
  {
    id: 6,
    name: 'Meera Nair',
    scenario: 'B2B Large Invoice (₹6.5L)',
    status: 'ACTIVE',
    riskTier: 'HIGH',
    tag: 'Human Escalation > ₹5L'
  },
  {
    id: 8,
    name: 'Sneha Patel',
    scenario: 'D2C Cart Drop (₹18.9k)',
    status: 'ACTIVE',
    riskTier: 'LOW',
    tag: 'UPI Intent Exit'
  }
];

export default function Header({
  activeTab,
  setActiveTab,
  activeCustomer,
  setActiveCustomer,
  metrics
}) {
  return (
    <header className="bg-[#080e1a]/95 border-b border-[#1b2a42] sticky top-0 z-40 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0c8ce9] via-[#00c988] to-[#05d59e] flex items-center justify-center shadow-lg shadow-[#00c988]/20 ring-1 ring-white/20">
                <DollarSign className="w-6 h-6 text-slate-950 font-black" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c988] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00c988] border-2 border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 font-display">
                  Razorpay AI Revenue Recovery
                </h1>
                <span className="bg-[#00c988]/10 text-[#00c988] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#00c988]/30">
                  Track 03 • Bounded Autonomy
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Detect Risk &bull; Diagnose Root Cause &bull; Policy Stopping Rules &bull; Win Back ₹
              </p>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          {metrics && (
            <div className="hidden xl:flex items-center gap-3 bg-[#0d1726] border border-[#1b2a42] px-3.5 py-1.5 rounded-2xl font-mono text-xs shadow-inner">
              <div>
                <span className="text-slate-400 text-[10px] block">AT RISK</span>
                <span className="text-amber-400 font-bold">₹{(metrics.total_revenue_at_risk / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-px h-6 bg-slate-800"></div>
              <div>
                <span className="text-slate-400 text-[10px] block">RECOVERED</span>
                <span className="text-[#00c988] font-black">₹{(metrics.total_money_recovered / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-px h-6 bg-slate-800"></div>
              <div>
                <span className="text-slate-400 text-[10px] block">RATE</span>
                <span className="text-[#0c8ce9] font-bold">{metrics.recovery_rate_percent}%</span>
              </div>
            </div>
          )}

          {/* Active Customer Persona Selector */}
          <div className="flex items-center gap-2 bg-[#0e1726] border border-[#1b2a42] p-1.5 rounded-2xl shadow-sm">
            <UserCheck className="w-4 h-4 text-[#00c988] ml-1.5 flex-shrink-0" />
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">Active Case:</span>
            <select
              value={activeCustomer.id}
              onChange={(e) => {
                const found = CUSTOMER_PERSONAS.find(p => p.id === Number(e.target.value));
                if (found) setActiveCustomer(found);
              }}
              className="bg-[#080d19] border border-[#1b2a42] text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00c988] cursor-pointer"
            >
              {CUSTOMER_PERSONAS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.scenario}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1.5 border-t border-[#1b2a42] pt-2 pb-1.5 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#00c988] to-[#05d59e] text-slate-950 font-black shadow-glow-emerald'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Revenue Hub 📊</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-[#0c8ce9] text-white shadow-glow-blue font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-300" />
            <span>Architecture &amp; Steps 🧠</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow-blue'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
            <span>Voice &amp; WhatsApp Lab 🗣️</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Orchestrator Chat 🤖</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Trail &amp; Logs 🛡️</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'policies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stopping Rules &amp; Policies ⚖️</span>
          </button>

          <button
            onClick={() => setActiveTab('escalations')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'escalations'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Escalations Queue 👤</span>
          </button>

        </div>

      </div>
    </header>
  );
}
