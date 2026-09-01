"""
ai/intent_router.py
--------------------
AI Intent & Revenue Loss Classifier for Track 03 AI Revenue Recovery Agent.

Classifies customer & merchant recovery interactions into:
  1. payment_failed_help (Initial failure report & diagnostic check)
  2. confirm_retry (User confirmation to execute bounded policy retry)
  3. checkout_recovery (Checkout Drop-off Recovery & Dynamic Link)
  4. mandate_sequencer (Subscription & Mandate Retry Sequencer)
  5. b2b_receivables_chaser (B2B Overdue Receivables & Promise-to-Pay)
  6. payment_degradation_fix (Payment Degradation & Gateway Fallback)
  7. fee_reversal (Fee waiver / reversal request)
  8. general_query (All other queries, FAQs, account inquiries, metric checks)
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

        # Questions asking for explanations/information should go to general_query / query engine
        is_informational_question = any(q in text for q in [
            "what is", "how do", "how does", "explain", "tell me about", "why is", "who are you",
            "can you explain", "what are", "how much", "what's", "show me", "status of", "what do",
            "meaning of", "details of"
        ])

        # 1. Direct Payment Failure Help (Conversational Entry)
        if any(term in text for term in [
            "my payment failed", "payment failed. i need help", "payment failed",
            "failed payment", "need help with payment", "transaction failed", "payment was declined"
        ]) and not any(term in text for term in ["reroute", "gateway switch", "b2b", "subscription", "how does", "what is"]):
            return {
                "intent": "payment_failed_help",
                "confidence": 0.99,
                "extracted_params": params,
                "explanation": "Detected Intent: Payment failure reported. Initiating transaction diagnostic lookup.",
            }

        # 2. Confirmation to Retry / Execute
        if text in ["yes", "yes.", "yes please", "yes, retry the payment", "yes, initiate retry", "retry", "retry now", "proceed with retry", "yes, retry", "retry payment"]:
            return {
                "intent": "confirm_retry",
                "confidence": 0.98,
                "extracted_params": params,
                "explanation": "Detected Intent: Customer confirmed recovery retry execution.",
            }

        # If it is an informational question, route to general query for deep reasoning
        if is_informational_question:
            return {
                "intent": "general_query",
                "confidence": 0.95,
                "extracted_params": params,
                "explanation": "Detected Intent: Informational query or knowledge question.",
            }

        # 3. Action: Checkout Recovery Workflow
        if any(term in text for term in [
            "recover abandoned checkout", "checkout recovery", "recover checkout",
            "impulse waiver", "send checkout link", "5% impulse"
        ]):
            return {
                "intent": "checkout_recovery",
                "confidence": 0.96,
                "extracted_params": params,
                "explanation": "Detected Intent: Checkout Abandonment Recovery with dynamic payment link & incentive.",
            }

        # 4. Action: Subscription Mandate Sequencer
        if any(term in text for term in [
            "sequence mandate retry", "mandate retry with updated card token",
            "execute mandate retry", "trigger mandate retry", "update mandate token"
        ]):
            return {
                "intent": "mandate_sequencer",
                "confidence": 0.95,
                "extracted_params": params,
                "explanation": "Detected Intent: Subscription Mandate Retry Sequencer & Token Update.",
            }

        # 5. Action: B2B Receivables & Promise to Pay
        if any(term in text for term in [
            "start hinglish b2b", "start hinglish b2b overdue voice chaser",
            "trigger b2b voice chaser", "execute b2b recovery", "chase b2b invoice", "b2b voice chaser"
        ]):
            return {
                "intent": "b2b_receivables_chaser",
                "confidence": 0.97,
                "extracted_params": params,
                "explanation": "Detected Intent: B2B Overdue Receivables Chaser with Hinglish voice/AI option & Promise-to-Pay.",
            }

        # 6. Action: Payment Degradation Fix
        if any(term in text for term in [
            "diagnose payment degradation & reroute gateway switch",
            "diagnose payment degradation", "reroute gateway switch", "fix payment degradation",
            "trigger gateway failover", "reroute to fallback"
        ]):
            return {
                "intent": "payment_degradation_fix",
                "confidence": 0.94,
                "extracted_params": params,
                "explanation": "Detected Intent: Payment Degradation Root Cause Analysis & Gateway Rerouting.",
            }

        # 7. Action: Fee Reversal
        if any(term in text for term in [
            "fee reversal", "reverse fee", "annual fee", "waive fee", "refund fee", "waive my annual fee"
        ]):
            return {
                "intent": "fee_reversal",
                "confidence": 0.95,
                "extracted_params": params,
                "explanation": "Detected Intent: Annual Fee Reversal Request.",
            }

        return {
            "intent": "general_query",
            "confidence": 0.80,
            "extracted_params": {},
            "explanation": "General query, account inquiry, or customer service question.",
        }
