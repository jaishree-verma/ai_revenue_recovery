import React from 'react';
import { CreditCard, ShieldCheck, AlertCircle, TrendingUp, Calendar, Zap } from 'lucide-react';

export default function CustomerContextCard({ customerData, accountData, cardsData, loading }) {
  if (loading || !customerData) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-2/3 mb-6"></div>
        <div className="h-20 bg-slate-800 rounded mb-4"></div>
      </div>
    );
  }

  const activeCard = cardsData && cardsData.length > 0 ? cardsData[0] : null;

  const creditLimit = accountData?.credit_limit || 0;
  const outstanding = accountData?.outstanding_balance || 0;
  const available = accountData?.available_limit || (creditLimit - outstanding);
  const utilizationPct = creditLimit > 0 ? Math.round((outstanding / creditLimit) * 100) : 0;

  const paymentScore = accountData?.payment_history_score || 0;
  let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (paymentScore < 70) scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (paymentScore < 50) scoreColor = 'text-red-400 bg-red-500/10 border-red-500/20';

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-6">
      
      {/* Header Profile */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-700">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            {customerData.name}
            {customerData.kyc_verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> KYC Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> KYC Pending
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">{customerData.email} • PAN: {customerData.pan}</p>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
          customerData.account_status === 'ACTIVE' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {customerData.account_status}
        </div>
      </div>

      {/* Credit Financial Overview */}
      {accountData && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Total Credit Limit
            </span>
            <span className="font-mono font-bold text-white text-sm">₹{creditLimit.toLocaleString()}</span>
          </div>

          {/* Utilization Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ${
                utilizationPct > 80 ? 'bg-red-500' : utilizationPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(utilizationPct, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-300 block text-[11px]">Available Credit</span>
              <span className="font-mono font-semibold text-emerald-400 text-xs mt-0.5 block">
                ₹{available.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-300 block text-[11px]">Outstanding ({utilizationPct}%)</span>
              <span className="font-mono font-semibold text-white text-xs mt-0.5 block">
                ₹{outstanding.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Score & Account Age */}
      {accountData && (
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl border ${scoreColor}`}>
            <span className="text-[11px] block opacity-90 text-white font-medium">Payment Score</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bold text-base font-mono">{paymentScore}</span>
              <span className="text-[10px] opacity-70">/ 100</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/80">
            <span className="text-[11px] text-slate-300 block">Account Age</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-xs text-white">{accountData.account_age_months} Months</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Card Mockup */}
      {activeCard && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 p-4 rounded-xl border border-emerald-700/30 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-extrabold text-emerald-300 tracking-wider uppercase">AMEX SERVICE AGENT</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeCard.card_status === 'ACTIVE' 
                ? 'bg-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {activeCard.card_status}
            </span>
          </div>

          <div className="font-mono text-sm font-bold tracking-widest text-white mb-2">
            {activeCard.card_number_masked}
          </div>

          <div className="flex justify-between items-end text-[10px] text-slate-300">
            <div>
              <span className="block text-[9px] text-slate-400">EXPIRY</span>
              <span className="font-mono text-white font-semibold">{activeCard.expiry_month}/{activeCard.expiry_year}</span>
            </div>
            <CreditCard className="w-5 h-5 text-emerald-400 opacity-90" />
          </div>
        </div>
      )}

    </div>
  );
}
