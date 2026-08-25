import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter,
  Sparkles,
  Zap,
  RotateCcw,
  Layers,
  ChevronRight,
  Activity,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import MultiAgentVisualizer from './MultiAgentVisualizer';
import RazorpayModal from './RazorpayModal';

export default function RevenueDashboard({ onSelectCase, onNavigateToArchitecture }) {
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResult, setBatchResult] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [singleRunningId, setSingleRunningId] = useState(null);
  const [activeItemTrace, setActiveItemTrace] = useState(null);
  const [selectedCheckoutItem, setSelectedCheckoutItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsData, metricsData] = await Promise.all([
        api.getRecoveryItems(),
        api.getRecoveryMetrics()
      ]);
      setItems(itemsData || []);
      setMetrics(metricsData || null);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBatch = async () => {
    setBatchRunning(true);
    setBatchResult(null);
    setBatchProgress(15);
    
    const progressTimer = setInterval(() => {
      setBatchProgress(prev => {
        if (prev >= 85) {
          clearInterval(progressTimer);
          return 85;
        }
        return prev + 20;
      });
    }, 200);

    try {
      const res = await api.executeBatchRecovery();
      clearInterval(progressTimer);
      setBatchProgress(100);
      setBatchResult(res);
      await fetchData();
    } catch (err) {
      console.error('Batch recovery failed:', err);
    } finally {
      setTimeout(() => {
        setBatchRunning(false);
        setBatchProgress(0);
      }, 500);
    }
  };

  const handleRunSingle = async (item) => {
    setSingleRunningId(item.id);
    try {
      const res = await api.executeSingleRecovery(item.id);
      setActiveItemTrace(res);
      await fetchData();
    } catch (err) {
      console.error(`Single recovery failed for #${item.id}:`, err);
    } finally {
      setSingleRunningId(null);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo cases and revenue data back to pending state?')) {
      setLoading(true);
      try {
        await api.resetRecoveryDemo();
        setBatchResult(null);
        setActiveItemTrace(null);
        await fetchData();
      } catch (err) {
        console.error('Reset failed:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchCat = categoryFilter === 'ALL' || item.track_category === categoryFilter;
    const matchStat = statusFilter === 'ALL' || item.status === statusFilter;
    return matchCat && matchStat;
  });

  const formatLakhs = (amt) => {
    if (!amt) return '₹0';
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Track 03 Hero & Batch Runner Action */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-razor-accent/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-razor-primary/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-razor-accent/10 border border-razor-accent/30 text-razor-accent text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Razorpay Buildathon • Track 03 AI Revenue Recovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Autonomous Revenue Recovery &amp; Governance
            </h2>
            <p className="text-xs sm:text-sm text-razor-textMuted leading-relaxed">
              Recovers revenue slipping away across checkout drop-offs, subscription declines, B2B overdue invoices, 
              and payment gateway degradations with strictly enforced stopping rules and measured ROI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunBatch}
              disabled={batchRunning || loading}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-razor-accent via-emerald-400 to-razor-accentHover hover:from-razor-accentHover hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-glow-emerald transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {batchRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Batch AI ({batchProgress}%)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Run Batch AI Recovery (All 7 Cases)</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              title="Reset test database back to initial state"
              className="flex items-center gap-1.5 px-4 py-3.5 bg-razor-panel hover:bg-razor-card text-slate-300 hover:text-white text-xs font-bold rounded-2xl border border-razor-border transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-razor-textMuted" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Streaming Progress Bar during batch run */}
        {batchRunning && (
          <div className="mt-4 pt-3 border-t border-razor-border">
            <div className="flex justify-between text-[11px] font-mono text-razor-accent font-bold mb-1">
              <span>AUTONOMOUS WORKFLOW STREAMING...</span>
              <span>{batchProgress}%</span>
            </div>
            <div className="w-full bg-razor-bg h-2 rounded-full overflow-hidden border border-razor-border">
              <div 
                className="bg-gradient-to-r from-razor-primary to-razor-accent h-full transition-all duration-300"
                style={{ width: `${batchProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI Money Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue at Risk */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden border border-razor-border shadow-lg">
          <div className="flex items-center justify-between text-razor-textMuted text-xs font-semibold mb-2">
            <span>REVENUE AT RISK</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
            {metrics ? formatLakhs(metrics.total_revenue_at_risk) : '₹0'}
          </div>
          <span className="text-[11px] text-amber-400 font-medium mt-1 block">
            {metrics?.items_count || 0} active revenue risk items detected
          </span>
        </div>

        {/* Revenue Recovered */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden border border-razor-accent/40 shadow-glow-emerald">
          <div className="flex items-center justify-between text-razor-accent text-xs font-semibold mb-2">
            <span>REVENUE RECOVERED</span>
            <div className="p-2 bg-razor-accent/10 text-razor-accent rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-razor-accent tracking-tight">
            {metrics ? formatLakhs(metrics.total_money_recovered) : '₹0'}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
            {metrics?.successful_recoveries || 0} successful / partial workflows
          </span>
        </div>

        {/* Recovery Rate */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden border border-razor-primary/40 shadow-glow-blue">
          <div className="flex items-center justify-between text-razor-primary text-xs font-semibold mb-2">
            <span>RECOVERY RATE</span>
            <div className="p-2 bg-razor-primary/10 text-razor-primary rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-razor-primary tracking-tight">
            {metrics ? `${metrics.recovery_rate_percent}%` : '0%'}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-razor-bg h-2 rounded-full mt-2 overflow-hidden border border-razor-border">
            <div 
              className="bg-gradient-to-r from-razor-primary to-razor-accent h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(metrics?.recovery_rate_percent || 0, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Bounded Autonomy Guardrails */}
        <div className="glass-panel p-5 rounded-3xl relative overflow-hidden border border-razor-border shadow-lg">
          <div className="flex items-center justify-between text-razor-textMuted text-xs font-semibold mb-2">
            <span>GOVERNANCE STOPS</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
              {metrics?.hard_stopped_count || 0}
            </span>
            <span className="text-xs text-razor-textMuted">Stopped</span>
            <span className="text-razor-border">|</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {metrics?.escalated_count || 0}
            </span>
            <span className="text-xs text-razor-textMuted">Escalated</span>
          </div>
          <span className="text-[11px] text-razor-textMuted font-medium mt-1 block">
            Stopping rules &amp; ₹5L cap strictly enforced
          </span>
        </div>

      </div>

      {/* Batch Execution Summary Notification Card */}
      {batchResult && (
        <div className="glass-panel-glow p-6 rounded-3xl border border-razor-accent shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-razor-accent text-slate-950 rounded-2xl font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Batch AI Recovery Executed with Measured ROI
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5 font-sans">
                  Processed {batchResult.total_items_processed} cases across Track 03 scenarios with bounded governance stopping rules.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setBatchResult(null)}
              className="text-razor-accent hover:text-white text-xs font-mono font-bold cursor-pointer"
            >
              ✕ DISMISS
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-razor-border font-mono text-xs">
            <div>
              <span className="text-razor-accent text-[10px] block font-bold">TOTAL RECOVERED</span>
              <span className="text-base font-black text-white">{formatLakhs(batchResult.total_money_recovered)}</span>
            </div>
            <div>
              <span className="text-razor-accent text-[10px] block font-bold">RECOVERY RATE</span>
              <span className="text-base font-black text-white">{batchResult.recovery_rate_percent}%</span>
            </div>
            <div>
              <span className="text-razor-accent text-[10px] block font-bold">SUCCESSFUL RUNS</span>
              <span className="text-base font-black text-white">{batchResult.successful_recoveries}</span>
            </div>
            <div>
              <span className="text-razor-accent text-[10px] block font-bold">HARD STOPS / ESCALATED</span>
              <span className="text-base font-black text-amber-300">
                {batchResult.hard_stopped_count} Stopped / {batchResult.escalated_count} Escalated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Agent Visual Architecture Pipeline */}
      <MultiAgentVisualizer activeTrace={activeItemTrace} />

      {/* Filter and Matrix Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-razor-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-razor-accent" />
          <span className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
            Revenue Risk Recovery Cases ({filteredItems.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-razor-panel border border-razor-border text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-razor-accent cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="CHECKOUT_DROP_OFF">Checkout Drop-Off</option>
            <option value="FAILED_SUBSCRIPTION">Subscription / Mandate</option>
            <option value="B2B_RECEIVABLES">B2B Overdue Receivables</option>
            <option value="PAYMENT_DEGRADATION">Payment Degradation</option>
            <option value="MANDATE_RETRY">Mandate Retry Lockout</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-razor-panel border border-razor-border text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-razor-accent cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending (Ready)</option>
            <option value="RECOVERED">Recovered ✅</option>
            <option value="PARTIALLY_RECOVERED">Partially Recovered ⏳</option>
            <option value="HARD_STOPPED">Hard Stopped 🛑</option>
            <option value="ESCALATED">Escalated 👤</option>
          </select>
        </div>
      </div>

      {/* Recovery Cases Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-razor-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-razor-panel text-razor-textMuted uppercase text-[10px] font-mono border-b border-razor-border">
              <tr>
                <th className="px-4 py-3.5">ID / Case Title</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Amount at Risk</th>
                <th className="px-4 py-3.5">Failure Reason</th>
                <th className="px-4 py-3.5">Retries / Limit</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Recovered ₹</th>
                <th className="px-4 py-3.5 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-razor-border/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-razor-textMuted">
                    Loading revenue risk items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-razor-textMuted">
                    No recovery cases found matching filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-razor-cardHover transition-colors">
                    
                    {/* Case Title */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-xs">{item.title}</div>
                      <div className="text-[10px] text-razor-textDim font-mono">Case #{item.id} • Cust #{item.customer_id}</div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border ${
                        item.track_category === 'CHECKOUT_DROP_OFF' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        item.track_category === 'FAILED_SUBSCRIPTION' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        item.track_category === 'B2B_RECEIVABLES' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        item.track_category === 'PAYMENT_DEGRADATION' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {item.track_category}
                      </span>
                    </td>

                    {/* Amount at Risk */}
                    <td className="px-4 py-3.5 font-mono font-bold text-white text-xs">
                      ₹{item.amount_at_risk.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Failure Reason */}
                    <td className="px-4 py-3.5 text-slate-300 text-[11px] max-w-xs truncate" title={item.failure_reason}>
                      {item.failure_reason}
                    </td>

                    {/* Retries */}
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <span className={item.retry_count >= item.max_retries ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {item.retry_count} / {item.max_retries}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        item.status === 'RECOVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.status === 'PARTIALLY_RECOVERED' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        item.status === 'HARD_STOPPED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        item.status === 'ESCALATED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-razor-panel text-slate-300 border-razor-border'
                      }`}>
                        {item.status === 'RECOVERED' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'PARTIALLY_RECOVERED' && <Clock className="w-3 h-3" />}
                        {item.status === 'HARD_STOPPED' && <XCircle className="w-3 h-3" />}
                        {item.status === 'ESCALATED' && <AlertTriangle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>

                    {/* Amount Recovered */}
                    <td className="px-4 py-3.5 font-mono font-bold text-xs">
                      {item.amount_recovered > 0 ? (
                        <span className="text-razor-accent font-black">
                          ₹{item.amount_recovered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-razor-textDim">—</span>
                      )}
                    </td>

                    {/* Autonomous AI Action Button */}
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      {item.track_category === 'CHECKOUT_DROP_OFF' && (
                        <button
                          onClick={() => setSelectedCheckoutItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-razor-panel hover:bg-razor-card text-razor-accent text-[11px] font-bold rounded-xl border border-razor-border transition-all cursor-pointer"
                          title="Preview Razorpay Dynamic Checkout Link"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Link</span>
                        </button>
                      )}

                      {item.status === 'PENDING' ? (
                        <button
                          onClick={() => handleRunSingle(item)}
                          disabled={singleRunningId === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-razor-accent to-emerald-400 hover:from-razor-accentHover hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {singleRunningId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>Run AI</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-razor-textDim font-mono">
                          {item.status === 'HARD_STOPPED' ? '🛑 Ceased' : '✓ Done'}
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Razorpay Modal if Checkout Link Preview is opened */}
      {selectedCheckoutItem && (
        <RazorpayModal
          item={selectedCheckoutItem}
          onClose={() => setSelectedCheckoutItem(null)}
          onPaymentSuccess={() => {
            setSelectedCheckoutItem(null);
            fetchData();
          }}
        />
      )}

    </div>
  );
}
