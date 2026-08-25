import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, CheckCircle, MessageSquare, Shield, Check, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function EscalationPortal() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [agentName, setAgentName] = useState('Agent Sarah Jenkins');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const data = await api.getEscalations();
      setEscalations(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      console.error('Failed to load escalations queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleResolve = async (newStatus) => {
    if (!selectedTicket || updating) return;
    setUpdating(true);
    try {
      const updated = await api.updateEscalation(selectedTicket.id, {
        status: newStatus,
        assigned_agent: agentName,
        resolution_notes: notes || `Resolved by ${agentName}.`
      });
      setEscalations(prev => prev.map(e => e.id === updated.id ? updated : e));
      setSelectedTicket(updated);
    } catch (err) {
      alert('Failed to update escalation ticket.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            Human Agent Escalation Queue
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            Servicing requests flagged as HIGH RISK or requiring human authorization by the Governance Engine.
          </p>
        </div>
        <button
          onClick={fetchEscalations}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-600 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Ticket List — Left 5 cols */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wider px-1">
            Active Tickets ({escalations.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 border border-slate-700 rounded-2xl font-medium">
              Loading escalation queue...
            </div>
          ) : escalations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 border border-slate-700 rounded-2xl font-medium">
              No open human handoff requests in queue.
            </div>
          ) : (
            escalations.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setNotes(ticket.resolution_notes || '');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/30 shadow-xl'
                    : 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Customer #{ticket.customer_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    ticket.status === 'OPEN'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : ticket.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-blue-400 font-semibold">{ticket.intent}</div>
                <p className="text-xs text-slate-300 line-clamp-2">{ticket.escalation_reason}</p>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 font-mono">
                  <span>Score: {ticket.risk_score || 'N/A'}/100</span>
                  <span>{new Date(ticket.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail & Resolution Panel — Right 7 cols */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 space-y-6 shadow-2xl sticky top-24">

              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-700 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-wider">
                    ESCALATION TICKET #{selectedTicket.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    Customer #{selectedTicket.customer_id} — {selectedTicket.intent}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">RISK SCORE</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{selectedTicket.risk_score || 75}/100</span>
                </div>
              </div>

              {/* Reason & AI Summary */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Escalation Reason
                  </h4>
                  <p className="text-xs text-white bg-blue-950/30 border border-blue-500/30 p-3 rounded-xl leading-relaxed">
                    {selectedTicket.escalation_reason}
                  </p>
                </div>

                {selectedTicket.conversation_summary && (
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> AI Conversation Summary
                    </h4>
                    <p className="text-xs text-white bg-slate-950 p-3 rounded-xl border border-slate-700 leading-relaxed font-mono">
                      {selectedTicket.conversation_summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Agent Resolution Form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" /> Human Agent Action & Override
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-300 font-mono block mb-1">Assigned Agent</label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 font-mono block mb-1">Current Ticket Status</label>
                    <div className="text-xs font-bold text-white py-1.5 px-3 bg-slate-800 rounded-lg border border-slate-700">
                      {selectedTicket.status}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 font-mono block mb-1">Agent Resolution Notes</label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter manual review notes, exception reasoning, or verification results..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleResolve('RESOLVED')}
                    disabled={updating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Resolve Request</span>
                  </button>
                  <button
                    onClick={() => handleResolve('CLOSED')}
                    disabled={updating}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition-colors"
                  >
                    Close Without Action
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-12 text-center text-xs text-slate-400 font-medium">
              Select an escalation ticket from the queue on the left to inspect context and perform human review.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
