import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  Activity 
} from 'lucide-react';
import { api } from '../services/api';
import AuditDetailModal from './AuditDetailModal';

export default function GovernanceDashboard() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(1, 100);
      setLogs(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesDecision = filterDecision === 'ALL' || log.decision === filterDecision;
    const matchesSearch = !searchQuery || 
      log.customer_id.toString().includes(searchQuery) ||
      log.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.policy_applied && log.policy_applied.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDecision && matchesSearch;
  });

  // Analytics
  const allowCount = logs.filter(l => l.decision === 'ALLOW').length;
  const escalateCount = logs.filter(l => l.decision === 'ESCALATE').length;
  const denyCount = logs.filter(l => l.decision === 'DENY').length;
  const allowPct = logs.length > 0 ? Math.round((allowCount / logs.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-700 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Governance & Audit Log Monitor
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            Immutable audit record of all policy evaluations and AI decision execution traces.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-600 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-300 font-semibold block">Total Evaluated</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">{logs.length}</span>
          </div>
          <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-emerald-400 font-bold block">ALLOW ({allowPct}%)</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{allowCount}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-amber-400 font-bold block">ESCALATED</span>
            <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">{escalateCount}</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-blue-400 font-bold block">DENIED</span>
            <span className="text-2xl font-black font-mono text-blue-400 mt-1 block">{denyCount}</span>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer ID, intent, or policy..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {['ALL', 'ALLOW', 'ESCALATE', 'DENY'].map(decision => (
            <button
              key={decision}
              onClick={() => setFilterDecision(decision)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                filterDecision === decision
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {decision}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] font-mono border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Cust ID</th>
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">Policy Applied</th>
                <th className="px-4 py-3">Risk Tier</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-400 font-medium">
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-400 font-medium">
                    No governance logs found matching filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#{log.id}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">Customer #{log.customer_id}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-semibold text-[11px]">{log.intent}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-extrabold text-[10px] px-2 py-0.5 rounded-full border ${
                        log.decision === 'ALLOW'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : log.decision === 'ESCALATE'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {log.decision === 'ALLOW' && <ShieldCheck className="w-3 h-3" />}
                        {log.decision === 'ESCALATE' && <AlertTriangle className="w-3 h-3" />}
                        {log.decision === 'DENY' && <XCircle className="w-3 h-3" />}
                        {log.decision}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-[11px] font-mono">
                      {log.policy_applied || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-white">
                      {log.risk_score !== undefined ? (
                        <span>{log.risk_score}/100 ({log.risk_tier})</span>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400 text-[11px]">
                      {log.result || 'PENDING'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Full Explainability Log"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

    </div>
  );
}
