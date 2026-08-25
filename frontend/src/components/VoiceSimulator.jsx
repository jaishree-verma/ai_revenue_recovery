import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  Calendar, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  Percent, 
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Zap,
  Play,
  VolumeX,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import RazorpayModal from './RazorpayModal';

export default function VoiceSimulator() {
  const [activeScenario, setActiveScenario] = useState('b2b'); // b2b | checkout | mandate
  const [callActive, setCallActive] = useState(false);
  const [audioStep, setAudioStep] = useState(0);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [promiseDate, setPromiseDate] = useState('2026-09-05');
  const [installmentAmt, setInstallmentAmt] = useState(42500);
  const [ptpSaved, setPtpSaved] = useState(false);
  const [savingPtp, setSavingPtp] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  const b2bDialogue = [
    {
      speaker: 'AI Voice Agent (Hinglish)',
      text: 'Namaste Anita ji! Main Razorpay Automated Accounts desk se bol raha hoon regarding your wholesale vendor supply invoice #8891 of ₹85,000.',
      time: '0:02',
      speechText: 'Namaste Anita ji. Main Razorpay Accounts desk se bol raha hoon regarding your wholesale vendor invoice of eighty-five thousand rupees.'
    },
    {
      speaker: 'Customer (Anita Kapoor)',
      text: 'Haanji, actually hamara client payment delayed tha isliye thoda cashflow mismatch ho gaya. We can clear 50% this week.',
      time: '0:07',
      speechText: 'Haanji, actually client payment delayed tha. We can clear 50% this week.'
    },
    {
      speaker: 'AI Voice Agent (Hinglish)',
      text: 'Samajh gaya Anita ji! Hum aapke liye 2-step Promise-to-Pay activate kar rahe hain: ₹42,500 aaj and remaining ₹42,500 on 5th September. Main aapko instant payment link WhatsApp par share kar raha hoon.',
      time: '0:14',
      speechText: 'Samajh gaya Anita ji. Hum aapke liye two-step Promise-to-Pay activate kar rahe hain: forty-two thousand five hundred today, and balance on fifth September.'
    },
    {
      speaker: 'Customer (Anita Kapoor)',
      text: 'Perfect! Please send the link on WhatsApp, main abhi 50% pay kar deti hoon. Thank you!',
      time: '0:19',
      speechText: 'Perfect, please send the link on WhatsApp. Thank you.'
    }
  ];

  const speak = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartCall = () => {
    setCallActive(true);
    setAudioStep(0);
    speak(b2bDialogue[0].speechText);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= b2bDialogue.length) {
        clearInterval(interval);
        return;
      }
      setAudioStep(current);
      speak(b2bDialogue[current].speechText);
    }, 4500);
  };

  const handleEndCall = () => {
    setCallActive(false);
    setAudioStep(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSavePromiseToPay = async () => {
    setSavingPtp(true);
    try {
      await api.recordPromiseToPay({
        risk_item_id: 3, // Anita Kapoor's item ID
        promise_date: promiseDate,
        installment_amount: Number(installmentAmt),
        number_of_installments: 2,
        language: 'HINGLISH'
      });
      setPtpSaved(true);
      setTimeout(() => setPtpSaved(false), 4000);
    } catch (err) {
      console.error('Failed to save Promise to Pay:', err);
    } finally {
      setSavingPtp(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-razor-border">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-razor-primary" />
            Hinglish Voice Recovery &amp; Multi-Channel Intervention Lab
          </h2>
          <p className="text-xs text-razor-textMuted mt-0.5 font-medium">
            Simulates dynamic recovery channels: Conversational Hinglish Voice Bot with Web Audio, Promise-to-Pay Scheduler, and 1-Click WhatsApp links.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex bg-razor-panel p-1 rounded-xl border border-razor-border">
          <button
            onClick={() => { setActiveScenario('b2b'); handleEndCall(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeScenario === 'b2b'
                ? 'bg-razor-primary text-white shadow-glow-blue'
                : 'text-razor-textMuted hover:text-white'
            }`}
          >
            B2B Voice Chaser (Hinglish)
          </button>
          <button
            onClick={() => { setActiveScenario('checkout'); handleEndCall(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeScenario === 'checkout'
                ? 'bg-razor-accent text-slate-950 shadow-glow-emerald font-black'
                : 'text-razor-textMuted hover:text-white'
            }`}
          >
            Checkout WhatsApp + 5% Link
          </button>
        </div>
      </div>

      {activeScenario === 'b2b' ? (
        /* B2B Hinglish Voice & Promise-to-Pay Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Interactive Voice Call Console */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-razor-border shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-razor-border">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${callActive ? 'bg-razor-accent animate-ping' : 'bg-slate-600'}`}></div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {callActive ? 'Live Hinglish Call in Progress' : 'Standby: Anita Kapoor (Overdue ₹85,000)'}
                    </h3>
                    <span className="text-[11px] text-razor-textMuted font-mono">
                      Target: +91 99887 76655 • Script: B2B Courteous Recovery v2
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    title={speechEnabled ? 'Mute Speech' : 'Enable Voice Speech'}
                    className="p-2 rounded-xl bg-razor-panel border border-razor-border text-slate-400 hover:text-white"
                  >
                    {speechEnabled ? <Volume2 className="w-3.5 h-3.5 text-razor-accent" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
                  </button>

                  {callActive ? (
                    <button
                      onClick={handleEndCall}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End Call</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartCall}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-razor-accent to-emerald-400 hover:from-razor-accentHover hover:to-emerald-300 text-slate-950 text-xs font-black rounded-xl shadow-glow-emerald transition-all transform active:scale-95 cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Play Hinglish AI Call 🗣️</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Waveform if call active */}
              {callActive && (
                <div className="flex items-center justify-center gap-1 my-4 py-3 bg-razor-bg rounded-2xl border border-razor-border">
                  <Volume2 className="w-4 h-4 text-razor-accent mr-2 animate-bounce" />
                  {[40, 75, 30, 95, 60, 85, 40, 100, 65, 90, 50, 95, 35, 80, 55, 70].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-razor-accent to-emerald-300 rounded-full animate-pulse"
                      style={{ height: `${h * 0.35}px`, animationDelay: `${i * 0.07}s` }}
                    ></div>
                  ))}
                  <span className="text-[10px] font-mono text-razor-accent ml-2 font-bold">24kHz HINGLISH TTS STREAM</span>
                </div>
              )}

              {/* Conversational Stream Transcript */}
              <div className="space-y-3 mt-4 max-h-72 overflow-y-auto pr-1">
                {b2bDialogue.slice(0, callActive ? audioStep + 1 : b2bDialogue.length).map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed transition-all ${
                      msg.speaker.includes('AI')
                        ? 'bg-razor-panel border-razor-primary/40 text-blue-100 ml-2'
                        : 'bg-emerald-950/40 border-razor-accent/40 text-emerald-100 mr-2'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                      <span className={msg.speaker.includes('AI') ? 'text-razor-primary font-black' : 'text-razor-accent font-black'}>
                        {msg.speaker}
                      </span>
                      <span className="text-razor-textDim">{msg.time}</span>
                    </div>
                    <p className="font-sans font-medium">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-razor-border flex items-center justify-between text-[11px] text-razor-textMuted font-mono">
              <span>Policy: Courteous recovery tone • No aggressive collection</span>
              <span className="text-razor-accent font-bold">✅ Bounded Safe</span>
            </div>
          </div>

          {/* Right: Promise-to-Pay Scheduler Form */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-razor-border shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                <Calendar className="w-4 h-4 text-razor-accent" />
                <span>Promise-to-Pay (PTP) Agreement Generator</span>
              </div>
              <p className="text-[11px] text-razor-textMuted mb-4 font-medium">
                Records legally binding customer payment schedules with automated webhook notifications.
              </p>

              <div className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Total Overdue Invoice:</label>
                  <input
                    type="text"
                    disabled
                    value="₹85,000.00 (Vendor Supply #INV-8891)"
                    className="w-full bg-razor-bg border border-razor-border text-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Upfront Token Installment (50%):</label>
                  <input
                    type="number"
                    value={installmentAmt}
                    onChange={(e) => setInstallmentAmt(e.target.value)}
                    className="w-full bg-razor-panel border border-razor-border text-white rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-razor-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Balance Promised Clearance Date:</label>
                  <input
                    type="date"
                    value={promiseDate}
                    onChange={(e) => setPromiseDate(e.target.value)}
                    className="w-full bg-razor-panel border border-razor-border text-white rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-razor-accent focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-razor-bg rounded-xl border border-razor-border text-[11px] text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-razor-textMuted">Immediate WhatsApp Link:</span>
                    <span className="text-razor-accent font-bold">₹{Number(installmentAmt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-razor-textMuted">Balance Auto-Reminder:</span>
                    <span className="text-amber-400 font-bold">₹{(85000 - Number(installmentAmt)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={handleSavePromiseToPay}
                disabled={savingPtp}
                className="w-full py-3.5 bg-gradient-to-r from-razor-accent to-emerald-400 hover:from-razor-accentHover hover:to-emerald-300 text-slate-950 font-black text-xs rounded-2xl shadow-glow-emerald transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingPtp ? (
                  <span>Recording PTP Agreement in DB...</span>
                ) : ptpSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Promise-to-Pay Logged in DB ✅</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                    <span>Save &amp; Activate Promise-to-Pay Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Checkout Abandonment & Dynamic Discount Link Layout */
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-razor-border shadow-2xl max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-razor-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-razor-accent/10 text-razor-accent rounded-2xl border border-razor-accent/30">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Dynamic Impulse Discount &amp; 1-Click WhatsApp Link
                </h3>
                <span className="text-[11px] text-razor-textMuted font-mono">
                  Priya Sharma • Cart Value: ₹24,990.00 • Drop: 3DS OTP Friction
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-mono font-bold">
              5% Max Impulse Cap
            </span>
          </div>

          {/* WhatsApp Message Preview */}
          <div className="bg-[#0b141a] p-5 rounded-3xl border border-emerald-900/40 text-xs font-sans text-slate-200 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-[#00c988] font-mono font-bold border-b border-slate-800 pb-2">
              <span>WHATSAPP REVENUE RECOVERY BOT</span>
              <span>+91 98765 43210</span>
            </div>

            <div className="bg-[#202c33] p-4 rounded-2xl rounded-tl-none max-w-lg space-y-2.5 border border-slate-700/40">
              <p className="text-slate-100 leading-relaxed">
                Hi <span className="font-bold text-[#00c988]">Priya Sharma</span>! 👋 We noticed your order for <strong>Ultra HD OLED Smart TV</strong> was interrupted due to a bank OTP timeout.
              </p>
              <div className="p-3 bg-[#111b21] rounded-xl border border-[#00c988]/30 text-[11px] font-mono space-y-1">
                <div className="text-slate-400">Original Cart Price: <span className="line-through">₹24,990.00</span></div>
                <div className="text-[#00c988] font-black text-xs">Special Recovery Offer (5% Off): ₹23,740.50</div>
                <div className="text-amber-400 text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Link valid for next 59 mins</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300">
                Click below to complete your checkout instantly with zero OTP friction:
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setShowRazorpayModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00c988] hover:bg-[#05d59e] text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer transform active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open 1-Click Razorpay Checkout (₹23,740.50)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-razor-border text-[11px] text-razor-textMuted font-mono">
            <span>Governance Rule: Max waiver cap &le; 15% (Offered: 5%)</span>
            <span className="text-razor-accent font-bold">Policy: PASSED ✓</span>
          </div>
        </div>
      )}

      {/* Razorpay Checkout Modal */}
      {showRazorpayModal && (
        <RazorpayModal
          item={{ id: 1, title: 'Ultra HD OLED Smart TV', amount_at_risk: 24990.0 }}
          onClose={() => setShowRazorpayModal(false)}
          onPaymentSuccess={() => {
            setShowRazorpayModal(false);
            alert('Payment of ₹23,740.50 confirmed via Razorpay! Revenue Recovered 💰');
          }}
        />
      )}

    </div>
  );
}
