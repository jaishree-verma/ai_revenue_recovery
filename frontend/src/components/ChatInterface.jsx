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
  DollarSign,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function ChatInterface({ activeCustomer, onGovernanceEvent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(`sess_${activeCustomer.id}_${Date.now()}`);

  const defaultPrompts = [
    'My payment failed. I need help.',
    'Recover abandoned checkout with 5% impulse waiver',
    'Sequence mandate retry with updated card token',
    'Start Hinglish B2B overdue voice chaser & Promise-to-Pay plan',
  ];

  // Reset conversation when switching customer persona
  useEffect(() => {
    sessionIdRef.current = `sess_${activeCustomer.id}_${Date.now()}`;
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Hello ${activeCustomer.name}! I am your **AI Revenue Recovery Agent**.\n\nI monitor and diagnose failed transactions, abandoned checkouts, mandate declines, and overdue invoices with strictly bounded policy governance.\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_prompts: defaultPrompts
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

      let nextPrompts = response.suggested_prompts || defaultPrompts;
      if (response.intent === 'payment_failed_help') {
        nextPrompts = ['Yes', 'Show details', 'Cancel'];
      }

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
        suggested_prompts: nextPrompts,
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
    <div className="flex flex-col h-[650px] max-h-[80vh] min-h-[520px] glass-panel rounded-3xl border border-razor-border shadow-2xl overflow-hidden">
      
      {/* Top Bar */}
      <div className="px-6 py-4 bg-[#080d19] border-b border-razor-border flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0c8ce9] to-[#00c988] flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#00c988]/20">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2 font-display">
              AI Revenue Recovery Agent
              <span className="w-2 h-2 rounded-full bg-[#00c988] animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Autonomous Assistant • Case ID: <span className="text-[#00c988] font-bold">RR-{1020 + activeCustomer.id}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sessionIdRef.current = `sess_${activeCustomer.id}_${Date.now()}`;
            setMessages([
              {
                id: Date.now(),
                sender: 'ai',
                text: `Session reset for ${activeCustomer.name}. Ready to assist with revenue recovery.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggested_prompts: defaultPrompts
              }
            ]);
          }}
          title="New Recovery Session"
          className="p-2 text-slate-400 hover:text-white hover:bg-razor-panel rounded-xl border border-transparent hover:border-razor-border transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user'
                ? 'bg-gradient-to-tr from-[#0c8ce9] to-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-razor-panel text-[#00c988] border border-[#00c988]/30 shadow-md'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content Bubble */}
            <div className="max-w-[85%] space-y-2.5">
              <div className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-[#0c8ce9] text-white rounded-tr-none font-semibold'
                  : 'bg-razor-panel/90 text-slate-100 border border-razor-border rounded-tl-none font-medium'
              }`}>
                {msg.text}
              </div>

              {/* Governance Decision Card (if attached to AI msg) */}
              {msg.governance_decision && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all shadow-lg ${
                  msg.governance_decision.decision === 'ALLOW'
                    ? 'bg-emerald-950/40 border-[#00c988]/40 text-white'
                    : msg.governance_decision.decision === 'ESCALATE'
                    ? 'bg-amber-950/40 border-amber-500/40 text-white'
                    : 'bg-red-950/40 border-red-500/40 text-white'
                }`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center space-x-2">
                      {msg.governance_decision.decision === 'ALLOW' && <ShieldCheck className="w-4 h-4 text-[#00c988]" />}
                      {msg.governance_decision.decision === 'ESCALATE' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {msg.governance_decision.decision === 'DENY' && <XCircle className="w-4 h-4 text-red-400" />}
                      <span className="font-mono font-bold tracking-wider uppercase text-[11px] text-white">
                        GOVERNANCE: {msg.governance_decision.decision}
                      </span>
                    </div>
                    {msg.governance_decision.risk_score !== undefined && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-slate-200">
                        Score: {msg.governance_decision.risk_score}/100 ({msg.governance_decision.risk_tier})
                      </span>
                    )}
                  </div>

                  <p className="text-slate-200 text-xs">{msg.governance_decision.reason}</p>

                  {/* Policy Applied Tag */}
                  {msg.governance_decision.policy_applied && (
                    <div className="text-[10px] font-mono text-slate-400">
                      Policy Applied: <span className="underline text-white font-semibold">{msg.governance_decision.policy_applied}</span>
                    </div>
                  )}

                  {/* Measured Recovered ₹ */}
                  {msg.amount_recovered > 0 && (
                    <div className="flex items-center gap-1.5 text-[#00c988] font-mono font-black text-xs pt-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Measured Revenue Recovered: ₹{msg.amount_recovered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* Collapsible Explainability Trace */}
                  {msg.governance_decision.explainability && (
                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                        className="flex items-center space-x-1 text-[11px] font-semibold text-slate-300 hover:text-[#0c8ce9] focus:outline-none cursor-pointer"
                      >
                        <span>View Explainability Trace</span>
                        {expandedTraceId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {expandedTraceId === msg.id && (
                        <pre className="mt-2 p-3 rounded-xl bg-[#050911] text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-razor-border">
                          {msg.governance_decision.explainability}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className={`text-[10px] text-slate-400 font-mono ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp}
              </div>

              {/* Preset Prompts Chips */}
              {msg.suggested_prompts && msg.suggested_prompts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.suggested_prompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className={`text-xs px-3.5 py-2 rounded-2xl border transition-all flex items-center gap-1.5 text-left cursor-pointer transform active:scale-95 ${
                        prompt === 'Yes' || prompt.includes('retry')
                          ? 'bg-gradient-to-r from-[#00c988] to-emerald-400 text-slate-950 font-black shadow-glow-emerald border-transparent'
                          : 'bg-razor-panel hover:bg-razor-card text-slate-200 hover:text-white border-razor-border hover:border-razor-accent/50 font-semibold'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 shrink-0 ${prompt === 'Yes' || prompt.includes('retry') ? 'text-slate-950' : 'text-[#00c988]'}`} />
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
            <div className="w-8 h-8 rounded-2xl bg-razor-panel flex items-center justify-center text-[#00c988] shrink-0 border border-razor-border">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-razor-panel border border-razor-border p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-200 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00c988] animate-ping"></span>
              <span>Running Risk Agent &rarr; Diagnosis &rarr; Governance Stopping Rules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-[#080d19] border-t border-razor-border">
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
            placeholder={`Type message or click a suggested prompt (e.g. "My payment failed. I need help.")...`}
            className="flex-1 bg-razor-bg border border-razor-border rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00c988]/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-[#00c988] to-[#05d59e] hover:from-[#05e69d] hover:to-[#00c988] disabled:opacity-40 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all shadow-glow-emerald cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5 fill-current" />
          </button>
        </form>
      </div>

    </div>
  );
}
