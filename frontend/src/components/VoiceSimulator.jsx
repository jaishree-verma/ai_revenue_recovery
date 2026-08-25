import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function VoiceSimulator() {
  const [activeScenario, setActiveScenario] = useState('b2b'); // b2b | checkout | mandate
  const [callActive, setCallActive] = useState(false);
  const [audioStep, setAudioStep] = useState(0);
  const [promiseDate, setPromiseDate] = useState('2026-09-05');
  const [installmentAmt, setInstallmentAmt] = useState(42500);
  const [ptpSaved, setPtpSaved] = useState(false);
  const [savingPtp, setSavingPtp] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const b2bDialogue = [
    {
      speaker: 'AI Voice Agent (Hinglish)',
      text: 'Namaste Anita ji! Main Razorpay Automated Accounts desk se bol raha hoon regarding your wholesale vendor supply invoice #8891 of ₹85,000.',
      time: '0:02'
    },
    {
      speaker: 'Customer (Anita Kapoor)',
      text: 'Haanji, actually hamara client payment delayed tha isliye thoda cashflow mismatch ho gaya. We can clear 50% this week.',
      time: '0:07'
    },
    {
      speaker: 'AI Voice Agent (Hinglish)',
      text: 'Samajh gaya Anita ji! Hum aapke liye 2-step Promise-to-Pay activate kar rahe hain: ₹42,500 aaj and remaining ₹42,500 on 5th September. Main aapko instant payment link WhatsApp par share kar raha hoon.',
      time: '0:14'
    },
    {
      speaker: 'Customer (Anita Kapoor)',
      text: 'Perfect! Please send the link on WhatsApp, main abhi 50% pay kar deti hoon. Thank you!',
      time: '0:19'
    }
  ];

  const checkoutDialogue = [
    {
      speaker: 'AI WhatsApp Agent',
      text: 'Hi Priya! We noticed your checkout for the Ultra HD OLED Smart TV (₹24,990) was interrupted due to a bank OTP timeout.',
      time: '0:01'
    },
    {
      speaker: 'AI WhatsApp Agent',
      text: '✨ Exclusive 5% Instant Impulse Discount applied! Pay ₹23,740.50 directly via 1-click Razorpay checkout link below. Valid for 60 minutes.',
      time: '0:02'
    }
  ];

  const handleStartCall = () => {
    setCallActive(true);
    setAudioStep(0);
    const interval = setInterval(() => {
      setAudioStep(prev => {
        if (prev >= b2bDialogue.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3500);
  };

  const handleEndCall = () => {
    setCallActive(false);
    setAudioStep(0);
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
      <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-400" />
            Hinglish Voice Recovery &amp; Multi-Channel Intervention Lab
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            Simulates dynamic recovery channels: Conversational Hinglish Voice Bot, Promise-to-Pay Scheduler, and 1-Click WhatsApp links.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => { setActiveScenario('b2b'); setCallActive(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeScenario === 'b2b'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            B2B Voice Chaser (Hinglish)
          </button>
          <button
            onClick={() => { setActiveScenario('checkout'); setCallActive(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeScenario === 'checkout'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
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
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 p-6 rounded-2xl shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${callActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {callActive ? 'Live Call in Progress (Hinglish AI Voice)' : 'Standby: Anita Kapoor (Overdue ₹85,000)'}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Target: +91 99887 76655 • Script: B2B Courteous Recovery v2
                    </span>
                  </div>
                </div>

                {callActive ? (
                  <button
                    onClick={handleEndCall}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartCall}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Start Hinglish AI Call</span>
                  </button>
                )}
              </div>

              {/* Animated Waveform if call active */}
              {callActive && (
                <div className="flex items-center justify-center gap-1 my-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <Volume2 className="w-4 h-4 text-emerald-400 mr-2 animate-bounce" />
                  {[40, 70, 25, 90, 55, 80, 35, 100, 60, 85, 45, 95, 30, 75].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full animate-pulse"
                      style={{ height: `${h * 0.35}px`, animationDelay: `${i * 0.08}s` }}
                    ></div>
                  ))}
                  <span className="text-[10px] font-mono text-emerald-400 ml-2 font-bold">24kHz PCM HINGLISH TTS</span>
                </div>
              )}

              {/* Conversational Stream Transcript */}
              <div className="space-y-3 mt-4 max-h-72 overflow-y-auto pr-1">
                {b2bDialogue.slice(0, callActive ? audioStep + 1 : b2bDialogue.length).map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                      msg.speaker.includes('AI')
                        ? 'bg-slate-800/90 border-blue-500/30 text-blue-100 ml-2'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100 mr-2'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                      <span className={msg.speaker.includes('AI') ? 'text-blue-400' : 'text-emerald-400'}>
                        {msg.speaker}
                      </span>
                      <span className="text-slate-500">{msg.time}</span>
                    </div>
                    <p className="font-sans">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Policy Enforcement: Courteous tone • No aggressive collection</span>
              <span className="text-emerald-400 font-bold">✅ Bounded Safe</span>
            </div>
          </div>

          {/* Right: Promise-to-Pay Scheduler Form */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-700/80 p-6 rounded-2xl shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Promise-to-Pay (PTP) Agreement Generator</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-4 font-medium">
                Records legally binding customer payment schedules with automated webhook notifications.
              </p>

              <div className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Total Overdue Invoice:</label>
                  <input
                    type="text"
                    disabled
                    value="₹85,000.00 (Vendor Supply #INV-8891)"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Upfront Token Installment (50%):</label>
                  <input
                    type="number"
                    value={installmentAmt}
                    onChange={(e) => setInstallmentAmt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Balance Promised Clearance Date:</label>
                  <input
                    type="date"
                    value={promiseDate}
                    onChange={(e) => setPromiseDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Immediate WhatsApp Link:</span>
                    <span className="text-emerald-400 font-mono font-bold">₹{Number(installmentAmt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance Auto-Reminder:</span>
                    <span className="text-amber-400 font-mono font-bold">₹{(85000 - Number(installmentAmt)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={handleSavePromiseToPay}
                disabled={savingPtp}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingPtp ? (
                  <span>Recording PTP in Database...</span>
                ) : ptpSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Promise-to-Pay Logged in DB ✅</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Activate Promise-to-Pay Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Checkout Abandonment & Dynamic Discount Link Layout */
        <div className="bg-slate-900/90 border border-slate-700/80 p-6 rounded-2xl shadow-2xl max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Dynamic Impulse Discount &amp; 1-Click WhatsApp Link
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Priya Sharma • Cart Value: ₹24,990.00 • Drop: 3DS OTP Friction
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-mono font-bold">
              5% Max Impulse Cap
            </span>
          </div>

          {/* WhatsApp Message Preview */}
          <div className="bg-[#0b141a] p-4 rounded-2xl border border-emerald-900/40 text-xs font-sans text-slate-200 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono font-bold border-b border-slate-800 pb-2">
              <span>WHATSAPP REVENUE RECOVERY BOT</span>
              <span>+91 98765 43210</span>
            </div>

            <div className="bg-[#202c33] p-3.5 rounded-xl rounded-tl-none max-w-lg space-y-2 border border-slate-700/40">
              <p className="text-slate-100">
                Hi <span className="font-bold text-emerald-400">Priya Sharma</span>! 👋 We noticed your order for <strong>Ultra HD OLED Smart TV</strong> was interrupted due to a bank OTP timeout.
              </p>
              <div className="p-2.5 bg-[#111b21] rounded-lg border border-emerald-500/30 text-[11px] font-mono">
                <div className="text-slate-400">Original Price: <span className="line-through">₹24,990.00</span></div>
                <div className="text-emerald-400 font-bold">Special Recovery Offer (5% Off): ₹23,740.50</div>
                <div className="text-amber-400 text-[10px] mt-0.5">⚡ Link expires in 59 mins</div>
              </div>
              <p className="text-[11px] text-slate-300">
                Click below to complete your payment instantly with zero 3DS friction:
              </p>
              <div className="pt-1">
                <a
                  href="#payment-sim"
                  onClick={(e) => { e.preventDefault(); alert('Redirecting to secure Razorpay checkout: ₹23,740.50'); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Pay ₹23,740.50 via Razorpay (1-Click)</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>Governance Rule: Max waiver cap &le; 15% (Offered: 5%)</span>
            <span className="text-emerald-400 font-bold">Policy: PASSED ✓</span>
          </div>
        </div>
      )}

    </div>
  );
}
