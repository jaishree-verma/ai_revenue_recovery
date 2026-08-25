"""
ai/intent_router.py
--------------------
AI Intent & Revenue Loss Classifier for Track 03 AI Revenue Recovery Agent.

Classifies customer & merchant recovery interactions into:
  1. checkout_recovery (Checkout Drop-off Recovery & Dynamic Link)
  2. mandate_sequencer (Subscription & Mandate Retry Sequencer)
  3. b2b_receivables_chaser (B2B Overdue Receivables & Promise-to-Pay)
  4. payment_degradation_fix (Payment Degradation & Gateway Fallback)
  5. fee_reversal / general_query
"""

import re
from typing import Dict, Any, Optional


class IntentRouter:
    """
    Classifies customer & recovery messages into Track 03 action categories.
    """

    def classify_intent(self, message: str) -> Dict[str, Any]:
        text = message.lower().strip()
        params = {}

        # 1. Checkout Recovery
        if any(term in text for term in [
            "checkout", "abandoned", "cart", "otp timeout", "impulse", "pay link",
            "payment link", "complete checkout", "buy now", "discount link"
        ]):
            return {
                "intent": "checkout_recovery",
                "confidence": 0.96,
                "extracted_params": params,
                "explanation": "Detected Intent: Checkout Abandonment Recovery with dynamic payment link & incentive.",
            }

        # 2. Subscription Mandate Sequencer
        if any(term in text for term in [
            "subscription", "mandate", "recurring", "auto debit", "auto-debit",
            "card expiry", "update card", "saas", "mandate retry"
        ]):
            return {
                "intent": "mandate_sequencer",
                "confidence": 0.95,
                "extracted_params": params,
                "explanation": "Detected Intent: Subscription Mandate Retry Sequencer & Token Update.",
            }

        # 3. B2B Receivables & Promise to Pay
        if any(term in text for term in [
            "b2b", "invoice", "overdue", "receivable", "promise to pay", "hinglish",
            "working capital", "vendor invoice", "installment", "pay later", "chaser"
        ]):
            return {
                "intent": "b2b_receivables_chaser",
                "confidence": 0.97,
                "extracted_params": params,
                "explanation": "Detected Intent: B2B Overdue Receivables Chaser with Hinglish voice/AI option & Promise-to-Pay.",
            }

        # 4. Payment Degradation Fix
        if any(term in text for term in [
            "payment degradation", "degraded", "gateway", "auth timeout", "bank switch",
            "3ds fail", "reroute", "retry gateway", "payment failed"
        ]):
            return {
                "intent": "payment_degradation_fix",
                "confidence": 0.94,
                "extracted_params": params,
                "explanation": "Detected Intent: Payment Degradation Root Cause Analysis & Gateway Rerouting.",
            }

        # 5. Fee Reversal
        if any(term in text for term in [
            "fee reversal", "reverse fee", "annual fee", "waive fee", "refund fee"
        ]):
            return {
                "intent": "fee_reversal",
                "confidence": 0.95,
                "extracted_params": params,
                "explanation": "Detected Intent: Annual Fee Reversal Request.",
            }

        return {
            "intent": "general_query",
            "confidence": 0.70,
            "extracted_params": {},
            "explanation": "General recovery query or transaction status check.",
        }
