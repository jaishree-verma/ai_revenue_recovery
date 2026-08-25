"""
ai/recovery_agent.py
--------------------
Recovery Decision Agent for Track 03 AI Revenue Recovery.

Decides the BEST intervention strategy:
- Smart Retry (off-peak, alternative gateway)
- Dynamic Payment Link (with personalized impulse discount/waiver)
- Hinglish Voice / WhatsApp Reminder Chaser
- Structured Promise-to-Pay Plan
- Human Specialist Escalation

Ensures proposals conform to bounded autonomy requirements before
passing to the Governance / Policy Engine.
"""

from typing import Dict, Any, Optional
from models import Customer, Account, Card, RevenueRiskItem


class RecoveryDecisionAgent:
    """
    Decides the optimal recovery intervention based on diagnosis,
    customer risk score, and recovery probability.
    """

    def decide_intervention(
        self,
        intent: str,
        customer: Customer,
        diagnosis: Dict[str, Any],
        risk_score: int,
        risk_item: Optional[RevenueRiskItem] = None,
    ) -> Dict[str, Any]:
        """
        Formulate an optimal intervention proposal.
        """
        amount = risk_item.amount_at_risk if risk_item else 25000.0
        category = diagnosis.get("category", "CHECKOUT_DROP_OFF")

        # 1. Checkout Drop-Off
        if category == "CHECKOUT_DROP_OFF":
            discount_pct = 5.0
            discount_amount = amount * (discount_pct / 100.0)
            net_amount = amount - discount_amount
            return {
                "intervention_type": "DYNAMIC_PAYMENT_LINK",
                "proposed_action": "generate_checkout_recovery_link",
                "channel": "WhatsApp + SMS",
                "discount_pct": discount_pct,
                "discount_amount": discount_amount,
                "net_recoverable_amount": net_amount,
                "recovery_probability": 0.82,
                "strategy_rationale": (
                    f"Selected 1-click Razorpay payment link with {discount_pct:.0f}% instant impulse "
                    f"discount (₹{discount_amount:,.2f} waiver) to reduce 3DS checkout friction."
                ),
                "payload": {
                    "payment_link": f"https://rzp.io/l/rec_chkt_{customer.id}992",
                    "expiry_minutes": 60,
                    "customer_phone": customer.phone,
                    "template": "Hinglish Checkout Assist"
                }
            }

        # 2. Failed Subscription / Mandate Retry
        elif category in ("FAILED_SUBSCRIPTION", "MANDATE_RETRY"):
            return {
                "intervention_type": "SMART_RETRY",
                "proposed_action": "smart_mandate_retry_sequence",
                "channel": "API Mandate Engine + Email Notification",
                "discount_pct": 0.0,
                "discount_amount": 0.0,
                "net_recoverable_amount": amount,
                "recovery_probability": 0.78,
                "strategy_rationale": (
                    "Selected 2-step Mandate Sequencer: Dispatches zero-touch card token update link "
                    "and schedules off-peak auto-retry during issuer high-success window (04:00 AM IST)."
                ),
                "payload": {
                    "retry_window": "OFF_PEAK_0400_IST",
                    "token_update_url": f"https://rzp.io/mandate/token_update_{customer.id}",
                    "retry_attempt": (risk_item.retry_count + 1) if risk_item else 1
                }
            }

        # 3. B2B Receivables Overdue
        elif category == "B2B_RECEIVABLES":
            if amount > 500000.0:
                return {
                    "intervention_type": "HUMAN_ESCALATION",
                    "proposed_action": "escalate_to_finance_specialist",
                    "channel": "Enterprise Finance Queue",
                    "discount_pct": 0.0,
                    "discount_amount": 0.0,
                    "net_recoverable_amount": amount,
                    "recovery_probability": 0.65,
                    "strategy_rationale": (
                        f"Invoice value (₹{amount:,.2f}) exceeds autonomous ₹5,00,000 threshold. "
                        "Escalating to Senior Corporate Relationship Manager for high-touch settlement."
                    ),
                    "payload": {
                        "escalation_queue": "B2B_LARGE_ENTERPRISE",
                        "priority": "HIGH"
                    }
                }

            upfront_portion = amount * 0.50
            return {
                "intervention_type": "PROMISE_TO_PAY_PLAN",
                "proposed_action": "hinglish_voice_chaser_and_promise_to_pay",
                "channel": "Conversational Hinglish Voice Bot + WhatsApp Agreement",
                "discount_pct": 0.0,
                "discount_amount": 0.0,
                "net_recoverable_amount": amount,
                "immediate_recovery_target": upfront_portion,
                "recovery_probability": 0.89,
                "strategy_rationale": (
                    f"Selected Conversational Hinglish Voice chaser with structured 2-step Promise-to-Pay: "
                    f"50% (₹{upfront_portion:,.2f}) upfront token settlement, remainder in 14 days."
                ),
                "payload": {
                    "language": customer.preferred_language or "HINGLISH",
                    "installment_1_amount": upfront_portion,
                    "installment_2_amount": amount - upfront_portion,
                    "voice_script_id": "b2b_courteous_overdue_v2"
                }
            }

        # 4. Payment Degradation
        elif category == "PAYMENT_DEGRADATION":
            return {
                "intervention_type": "SMART_RETRY",
                "proposed_action": "reroute_gateway_switch",
                "channel": "Autonomous Gateway Switcher",
                "discount_pct": 0.0,
                "discount_amount": 0.0,
                "net_recoverable_amount": amount,
                "recovery_probability": 0.94,
                "strategy_rationale": (
                    "Selected instant multi-gateway failover switch. Rerouting traffic from degraded "
                    "primary acquirer to ultra-low latency fallback gateway route."
                ),
                "payload": {
                    "primary_gateway": "ACQUIRER_A_DEGRADED",
                    "fallback_gateway": "ACQUIRER_B_OPTIMIZED",
                    "expected_latency_ms": 320
                }
            }

        # Default fallback
        return {
            "intervention_type": "SMART_RETRY",
            "proposed_action": "execute_standard_recovery",
            "channel": "WhatsApp",
            "discount_pct": 0.0,
            "discount_amount": 0.0,
            "net_recoverable_amount": amount,
            "recovery_probability": 0.70,
            "strategy_rationale": "Standard automated recovery intervention selected.",
            "payload": {}
        }
