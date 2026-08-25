import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  Percent, 
  ArrowRight,
  Lock,
  Sparkles,
  Zap
} from 'lucide-react';

export default function RazorpayModal({ item, onClose, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('upi'); // upi | card | netbanking
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const originalAmount = item ? item.amount_at_risk : 24990.0;
  const discountPct = 5.0;
  const discountAmount = originalAmount * (discountPct / 100.0);
  const netPayable = originalAmount - discountAmount;

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(netPayable);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      
      <div className="w-full max-w-md bg-[#0c1424] border border-[#1b2a42] rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Top Razorpay Header */}
        <div className="bg-[#080d19] p-5 border-b border-[#1b2a42] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0c8ce9] to-[#00c988] flex items-center justify-center text-white font-black text-xs shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-tight">Razorpay Checkout</span>
                <span className="text-[10px] font-mono font-bold bg-[#00c988]/10 text-[#00c988] px-1.5 py-0.5 rounded border border-[#00c988]/30">
                  Secured
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Merchant: Enterprise AI Recovery</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing & Recovery Coupon Bar */}
        <div className="p-5 bg-[#101a2d] border-b border-[#1b2a42] space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-300 font-medium">Order: {item ? item.title : 'Checkout Drop-off Recovery'}</span>
            <div className="text-right">
              <span className="text-xs text-slate-400 line-through mr-2">₹{originalAmount.toLocaleString('en-IN')}</span>
              <span className="text-xl font-black font-mono text-[#00c988]">
                ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#00c988]/10 border border-[#00c988]/30 rounded-xl text-xs text-[#00c988]">
            <div className="flex items-center gap-1.5 font-bold font-mono">
              <Percent className="w-3.5 h-3.5" />
              <span>COUPON 'RECOVER5' APPLIED</span>
            </div>
            <span className="font-mono font-bold">-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {!success ? (
          /* Payment Methods Body */
          <div className="p-5 space-y-4">
            <div className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
              Select Preferred Payment Option
            </div>

            <div className="space-y-2 font-sans text-xs">
              {/* UPI Option */}
              <button
                onClick={() => setSelectedMethod('upi')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedMethod === 'upi'
                    ? 'bg-[#142238] border-[#0c8ce9] ring-1 ring-[#0c8ce9]/50 text-white'
                    : 'bg-[#0e1726] border-[#1b2a42] text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0c8ce9]/10 text-[#0c8ce9] rounded-xl">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Instant UPI (GPay, PhonePe, Paytm)</span>
                    <span className="text-[11px] text-slate-400">Zero OTP friction • 1-Click intent</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'upi' ? 'border-[#0c8ce9] bg-[#0c8ce9]' : 'border-slate-600'
                }`}>
                  {selectedMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
              </button>

              {/* Cards Option */}
              <button
                onClick={() => setSelectedMethod('card')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-[#142238] border-[#0c8ce9] ring-1 ring-[#0c8ce9]/50 text-white'
                    : 'bg-[#0e1726] border-[#1b2a42] text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-xl">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-white">Credit / Debit Card (Saved Tokens)</span>
                    <span className="text-[11px] text-slate-400">Amex, Visa, Mastercard, RuPay</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'card' ? 'border-[#0c8ce9] bg-[#0c8ce9]' : 'border-slate-600'
                }`}>
                  {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
              </button>
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full py-3.5 bg-gradient-to-r from-[#00c988] to-[#05d59e] hover:from-[#05e69d] hover:to-[#00c988] text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-[#00c988]/20 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                    <span>Processing Autonomous Recovery...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 fill-current" />
                    <span>Pay ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Now</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00c988]" />
              <span>256-Bit SSL Encryption • RBI &amp; NPCI Compliant</span>
            </div>
          </div>
        ) : (
          /* Payment Success Confirmation */
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#00c988]/20 border border-[#00c988]/40 text-[#00c988] flex items-center justify-center mx-auto shadow-lg shadow-[#00c988]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Payment Recovered Successfully!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Transaction reference <span className="font-mono text-[#00c988]">#pay_rec_99218</span> has been confirmed.
              </p>
            </div>

            <div className="p-3.5 bg-[#0e1726] rounded-2xl border border-[#1b2a42] font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Amount Realized:</span>
                <span className="text-white font-bold">₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between mt-1 text-[#00c988]">
                <span>Status:</span>
                <span className="font-bold">RECOVERED ✅</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#0c8ce9] hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close &amp; View Audit Trail
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
