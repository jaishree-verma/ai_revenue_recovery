import React from 'react';
import { X, ShieldCheck, AlertTriangle, XCircle, FileText, Clock, User, CheckCircle } from 'lucide-react';

export default function AuditDetailModal({ log, onClose }) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Governance Audit Record #{log.id}</h3>
              <p className="text-xs text-slate-300 font-mono">Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Decision Overview Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            log.decision === 'ALLOW' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-white'
              : log.decision === 'ESCALATE'
              ? 'bg-amber-950/40 border-amber-500/30 text-white'
              : 'bg-red-950/40 border-red-500/30 text-white'
          }`}>
            <div className="flex items-center space-x-3">
              {log.decision === 'ALLOW' && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
              {log.decision === 'ESCALATE' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
              {log.decision === 'DENY' && <XCircle className="w-6 h-6 text-red-400" />}
              <div>
                <span className="font-black tracking-wider uppercase text-sm text-white">{log.decision}</span>
                <p className="text-xs opacity-90 text-white">{log.reason || 'Decision reached by policy engine.'}</p>
              </div>
            </div>
            {log.risk_score !== undefined && (
              <div className="text-right font-mono text-white">
                <span className="block text-[10px] opacity-80">RISK SCORE</span>
                <span className="font-bold text-base">{log.risk_score} / 100</span>
                <span className="block text-[10px] uppercase tracking-wider">{log.risk_tier}</span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-300 block text-[10px] uppercase font-mono">Customer ID</span>
              <span className="font-bold text-white">Customer #{log.customer_id}</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-300 block text-[10px] uppercase font-mono">Intent</span>
              <span className="font-bold text-blue-400 font-mono">{log.intent}</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-300 block text-[10px] uppercase font-mono">Policy Applied</span>
              <span className="font-bold text-white">{log.policy_applied || 'N/A'}</span>
            </div>
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-300 block text-[10px] uppercase font-mono">Final Result</span>
              <span className="font-bold text-emerald-400">{log.result || 'EXECUTED'}</span>
            </div>
          </div>

          {/* Explainability Log */}
          {log.reason && (
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Policy & Governance Explanation
              </h4>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-700 text-white font-mono text-[11px] leading-relaxed">
                {log.reason}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
