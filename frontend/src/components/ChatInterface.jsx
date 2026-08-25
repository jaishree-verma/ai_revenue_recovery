import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Clock, 
  RefreshCw,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';

export default function ChatInterface({ activeCustomer, onGovernanceEvent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(`sess_${activeCustomer.id}_${Date.now()}`);

  const getInitialPrompts = () => {
    return [
      'Recover abandoned checkout with 5% impulse waiver',
      'Sequence mandate retry with updated card token',
      'Start Hinglish B2B overdue voice chaser & Promise-to-Pay plan',
      'Diagnose payment degradation & reroute gateway switch',
    ];
  };

  // Reset conversation when switching customer persona
  useEffect(() => {
    sessionIdRef.current = `sess_${activeCustomer.id}_${Date.now()}`;
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Hello ${activeCustomer.name}! I am your **AI Revenue Recovery Orchestrator**.\n\nI monitor revenue at risk across checkout drop-offs, failed subscriptions, overdue B2B receivables, and payment gateway degradations. Every intervention passes strictly through our **Governance & Stopping Rules Engine** before execution.\n\nHow would you like to proceed?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_prompts: getInitialPrompts()
      }
    ]);
  }, [activeCustomer.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend = input) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage({
        customer_id: activeCustomer.id,
        session_id: sessionIdRef.current,
        message: query
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.message,
        intent: response.intent,
        governance_decision: response.governance_decision,
        action_executed: response.action_executed,
        escalated: response.escalated,
        amount_recovered: response.amount_recovered,
        data: response.data,
        suggested_prompts: response.suggested_prompts || getInitialPrompts(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      if (onGovernanceEvent) onGovernanceEvent();
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Apologies, I encountered a communication error with the revenue recovery backend. Please verify that the FastAPI server is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[75vh] min-h-[500px] bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* Top Bar */}
      <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Track 03 Autonomous Orchestrator
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-300 font-mono">Session: {sessionIdRef.current}</p>
          </div>
        </div>
        <button
          onClick={() => {
            sessionIdRef.current = `sess_${activeCustomer.id}_${Date.now()}`;
            setMessages([
              {
                id: Date.now(),
                sender: 'ai',
                text: `Session reset for ${activeCustomer.name}. Ready to diagnose or recover revenue at risk.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggested_prompts: getInitialPrompts()
              }
            ]);
          }}
          title="New Recovery Session"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800 text-slate-100 border border-emerald-500/20'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
            </div>

            {/* Content Bubble */}
            <div className="max-w-[85%] space-y-2">
              <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                  : 'bg-slate-800 text-white border border-slate-700 rounded-tl-none font-medium'
              }`}>
                {msg.text}
              </div>

              {/* Governance Decision & Measured Recovery Card */}
              {msg.governance_decision && (
                <div className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                  msg.governance_decision.decision === 'ALLOW'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-white'
                    : msg.governance_decision.decision === 'ESCALATE'
                    ? 'bg-amber-950/50 border-amber-500/40 text-white'
                    : 'bg-red-950/50 border-red-500/40 text-white'
                }`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center space-x-2">
                      {msg.governance_decision.decision === 'ALLOW' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {msg.governance_decision.decision === 'ESCALATE' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {msg.governance_decision.decision === 'DENY' && <XCircle className="w-4 h-4 text-red-400" />}
                      <span className="font-bold tracking-wider uppercase text-[11px] text-white">
                        GOVERNANCE: {msg.governance_decision.decision}
                      </span>
                    </div>
                    {msg.governance_decision.risk_score !== undefined && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/50 border border-white/10 text-white">
                        Risk Score: {msg.governance_decision.risk_score}/100 ({msg.governance_decision.risk_tier})
                      </span>
                    )}
                  </div>

                  <p className="text-white text-xs">{msg.governance_decision.reason}</p>

                  {/* Policy Applied Tag */}
                  {msg.governance_decision.policy_applied && (
                    <div className="text-[10px] font-mono text-zinc-300">
                      Policy Applied: <span className="underline text-white font-semibold">{msg.governance_decision.policy_applied}</span>
                    </div>
                  )}

                  {/* Measured Recovered ₹ */}
                  {msg.amount_recovered > 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs pt-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Measured Revenue Recovered: ₹{msg.amount_recovered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* Collapsible Explainability Trace */}
                  {msg.governance_decision.explainability && (
                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                        className="flex items-center space-x-1 text-[11px] font-semibold text-white hover:text-blue-400 focus:outline-none"
                      >
                        <span>View Explainability Trace</span>
                        {expandedTraceId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {expandedTraceId === msg.id && (
                        <pre className="mt-2 p-2.5 rounded-lg bg-slate-950/90 text-[10px] font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-700">
                          {msg.governance_decision.explainability}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className={`text-[10px] text-slate-300 font-mono ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp}
              </div>

              {/* Preset Prompts Chips */}
              {msg.suggested_prompts && msg.suggested_prompts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {msg.suggested_prompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-xs bg-slate-800 hover:bg-emerald-600/20 hover:border-emerald-500/40 text-white hover:text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-200 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Running Risk Agent &rarr; Diagnosis &rarr; Governance Stopping Rules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask recovery orchestrator for ${activeCustomer.name}...`}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <span>Run AI</span>
            <Send className="w-3.5 h-3.5 fill-current" />
          </button>
        </form>
      </div>

    </div>
  );
}
