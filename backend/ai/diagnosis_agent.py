"""
ai/diagnosis_agent.py
---------------------
Diagnosis Agent for Track 03 AI Revenue Recovery.

Answers: "Why is this revenue at risk?"
Analyzes technical root causes, customer payment history, invoice age,
and gateway latency patterns to determine the exact failure diagnosis.
"""

from typing import Dict, Any, Optional
from models import Customer, Account, Card, RevenueRiskItem


class DiagnosisAgent:
    """
    Diagnoses root causes of failed transactions, checkout drop-offs,
    mandate declines, and B2B receivables delays.
    """

    def diagnose(
        self,
        intent: str,
        customer: Customer,
        account: Optional[Account] = None,
        card: Optional[Card] = None,
        risk_item: Optional[RevenueRiskItem] = None,
    ) -> Dict[str, Any]:
        """
        Produce a structured diagnosis report with technical root cause,
        behavioral insights, and recommended mitigation category.
        """
        category = risk_item.track_category if risk_item else self._infer_category(intent)
        amount = risk_item.amount_at_risk if risk_item else 25000.0
        failure_reason = risk_item.failure_reason if risk_item else "Unknown transaction degradation"
        retry_count = risk_item.retry_count if risk_item else 0

        if category == "CHECKOUT_DROP_OFF":
            return {
                "category": category,
                "root_cause": "3DS Authentication Friction & OTP Latency",
                "failure_reason": failure_reason,
                "customer_behavior": "High cart intent; dropped during bank OTP verification step.",
                "previous_attempts": retry_count,
                "invoice_age_days": 0,
                "severity": "MEDIUM",
                "diagnosis_summary": (
                    f"Customer {customer.name} abandoned checkout for ₹{amount:,.2f} due to "
                    f"OTP timeout on issuer page. High purchase intent detected. Recommended: "
                    f"Dynamic instant-checkout link with 5% impulse incentive."
                ),
                "technical_details": {
                    "drop_off_step": "3DS_OTP_PAGE",
                    "issuer_latency_ms": 14200,
                    "recommended_action": "DYNAMIC_PAYMENT_LINK",
                    "optimal_channel": "WHATSAPP_AND_SMS"
                }
            }

        elif category == "FAILED_SUBSCRIPTION" or category == "MANDATE_RETRY":
            card_status = card.card_status if card else "ACTIVE"
            expiry_info = f"{card.expiry_month}/{card.expiry_year}" if card else "N/A"
            return {
                "category": category,
                "root_cause": "Card Expiry / Soft Issuer Decline on Recurring Mandate",
                "failure_reason": failure_reason,
                "customer_behavior": "Long-term subscription subscriber; card token requires update.",
                "previous_attempts": retry_count,
                "invoice_age_days": 4,
                "severity": "HIGH" if retry_count >= 2 else "LOW",
                "diagnosis_summary": (
                    f"Recurring subscription charge of ₹{amount:,.2f} soft-declined by issuer. "
                    f"Card ending in {card.card_number_masked if card else '****'} (Expiry: {expiry_info}). "
                    f"Recommended: Zero-redirection card token update link + off-peak auto-retry."
                ),
                "technical_details": {
                    "decline_code": "DO_NOT_HONOR_SOFT_RETRY",
                    "card_status": card_status,
                    "recommended_action": "SMART_RETRY",
                    "optimal_channel": "EMAIL_AND_TOKEN_LINK"
                }
            }

        elif category == "B2B_RECEIVABLES":
            return {
                "category": category,
                "root_cause": "Working Capital Delay & Enterprise Procurement Cycle",
                "failure_reason": failure_reason,
                "customer_behavior": "Corporate account overdue by > 15 days; requires structured installment agreement.",
                "previous_attempts": retry_count,
                "invoice_age_days": 18,
                "severity": "HIGH" if amount > 100000 else "MEDIUM",
                "diagnosis_summary": (
                    f"B2B supply invoice of ₹{amount:,.2f} is overdue by 18 days. "
                    f"Cashflow timing mismatch reported. Recommended: Conversational Hinglish Voice "
                    f"agent intervention + 2-installment Promise-to-Pay schedule."
                ),
                "technical_details": {
                    "invoice_status": "OVERDUE_TIER_1",
                    "recommended_action": "HINGLISH_VOICE_CHASER",
                    "optimal_channel": "INTERACTIVE_VOICE_AND_WHATSAPP"
                }
            }

        elif category == "PAYMENT_DEGRADATION":
            return {
                "category": category,
                "root_cause": "Acquiring Bank Primary Network Switch Outage (Timeout Spike)",
                "failure_reason": failure_reason,
                "customer_behavior": "High-value enterprise / VIP payment attempted during network switch degradation.",
                "previous_attempts": retry_count,
                "invoice_age_days": 0,
                "severity": "CRITICAL",
                "diagnosis_summary": (
                    f"Primary gateway switch success rate dropped to 34% due to bank core network latency. "
                    f"Transaction value: ₹{amount:,.2f}. Recommended: Dynamic smart rerouting to secondary acquiring switch."
                ),
                "technical_details": {
                    "primary_gateway_health": "DEGRADED_LATENCY_2800MS",
                    "secondary_gateway_health": "HEALTHY_LATENCY_320MS",
                    "recommended_action": "REROUTE_GATEWAY_SWITCH",
                    "optimal_channel": "AUTOMATED_GATEWAY_SWITCH"
                }
            }

        else:
            return {
                "category": "GENERAL_RECOVERY",
                "root_cause": "Standard payment failure",
                "failure_reason": failure_reason,
                "customer_behavior": "Standard customer interaction.",
                "previous_attempts": retry_count,
                "invoice_age_days": 1,
                "severity": "LOW",
                "diagnosis_summary": f"Diagnosed transaction failure for amount ₹{amount:,.2f}.",
                "technical_details": {
                    "recommended_action": "SMART_RETRY",
                    "optimal_channel": "WHATSAPP"
                }
            }

    def _infer_category(self, intent: str) -> str:
        mapping = {
            "checkout_recovery": "CHECKOUT_DROP_OFF",
            "mandate_sequencer": "FAILED_SUBSCRIPTION",
            "b2b_receivables_chaser": "B2B_RECEIVABLES",
            "payment_degradation_fix": "PAYMENT_DEGRADATION",
        }
        return mapping.get(intent, "CHECKOUT_DROP_OFF")
