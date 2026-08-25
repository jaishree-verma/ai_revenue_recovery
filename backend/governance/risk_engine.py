"""
governance/risk_engine.py
--------------------------
Weighted risk scoring model for the Amex AI Servicing Agent.

Produces a numeric risk score (0–100) and a tier (LOW | MEDIUM | HIGH | CRITICAL)
that the governance orchestrator uses to make the final decision.

Score composition:
    Factor                         Max Weight  Direction
    ─────────────────────────────  ──────────  ──────────────────────────────
    Outstanding balance ratio      30          High utilisation → higher risk
    Payment history score          25          Low score → higher risk
    Account age                    20          Newer account → higher risk
    Requested action magnitude     15          Larger action → higher risk
    KYC status                     10          Not verified → higher risk

Decision thresholds:
    LOW      (0–30)   → decision_hint = ALLOW
    MEDIUM   (31–60)  → decision_hint = ALLOW  (with advisory note)
    HIGH     (61–80)  → decision_hint = ESCALATE
    CRITICAL (81–100) → decision_hint = DENY
"""

from __future__ import annotations
from dataclasses import dataclass, field
from models import Customer, Account


# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------

@dataclass
class RiskResult:
    score: int          # 0–100, higher = riskier
    tier: str           # LOW | MEDIUM | HIGH | CRITICAL
    decision_hint: str  # ALLOW | ESCALATE | DENY
    explanation: str    # Human-readable breakdown
    factor_scores: dict = field(default_factory=dict)  # per-factor contributions


# ---------------------------------------------------------------------------
# RiskEngine
# ---------------------------------------------------------------------------

class RiskEngine:
    """
    Computes a composite risk score for a governance request.

    Usage:
        engine = RiskEngine()
        result = engine.evaluate(customer, account, intent, requested_limit_increase=50000)
    """

    # Thresholds
    LOW_MAX = 30
    MEDIUM_MAX = 60
    HIGH_MAX = 80
    # > 80 → CRITICAL

    def evaluate(
        self,
        customer: Customer,
        account: Account | None,
        intent: str,
        requested_limit_increase: float | None = None,
    ) -> RiskResult:
        """
        Calculate the composite risk score.
        Each factor returns a contribution in [0, factor_max].
        """
        factor_scores: dict[str, int] = {}
        explanation_parts: list[str] = []

        # ── Factor 1: Outstanding balance ratio (max 30) ──────────────────
        if account and account.credit_limit > 0:
            utilisation = account.outstanding_balance / account.credit_limit
            f1 = min(int(utilisation * 30), 30)
        else:
            f1 = 15  # moderate risk if account not found
        factor_scores["balance_utilisation"] = f1
        explanation_parts.append(
            f"Balance utilisation risk: {f1}/30 "
            f"({'no account' if account is None else f'{account.outstanding_balance / account.credit_limit:.0%} utilisation'})"
        )

        # ── Factor 2: Payment history score (max 25) ──────────────────────
        # payment_history_score is 0–100; low score → high risk
        if account:
            payment_score = account.payment_history_score
            # Invert: score 100 → f2=0, score 0 → f2=25
            f2 = max(0, min(25, int((100 - payment_score) * 0.25)))
        else:
            f2 = 12
        factor_scores["payment_history"] = f2
        explanation_parts.append(
            f"Payment history risk: {f2}/25 "
            f"(score={account.payment_history_score if account else 'N/A'})"
        )

        # ── Factor 3: Account age (max 20) ────────────────────────────────
        # Newer accounts (<6 months) are riskier
        if account:
            age = account.account_age_months
            if age < 3:
                f3 = 20
            elif age < 6:
                f3 = 14
            elif age < 12:
                f3 = 8
            elif age < 24:
                f3 = 4
            else:
                f3 = 0
        else:
            f3 = 10
        factor_scores["account_age"] = f3
        explanation_parts.append(
            f"Account age risk: {f3}/20 "
            f"(age={account.account_age_months if account else 'N/A'} months)"
        )

        # ── Factor 4: Action magnitude (max 15) ───────────────────────────
        if intent == "credit_limit_increase" and requested_limit_increase and account:
            if account.credit_limit > 0:
                pct = requested_limit_increase / account.credit_limit
                f4 = min(15, int(pct * 50))   # 30% increase → f4=15
            else:
                f4 = 10
        elif intent in ("card_block", "card_replacement"):
            f4 = 5   # moderate; time-sensitive but reversible risk
        elif intent == "fee_reversal":
            f4 = 3   # low magnitude
        else:
            f4 = 7
        factor_scores["action_magnitude"] = f4
        explanation_parts.append(f"Action magnitude risk: {f4}/15 (intent={intent})")

        # ── Factor 5: KYC status (max 10) ─────────────────────────────────
        f5 = 0 if customer.kyc_verified else 10
        factor_scores["kyc_status"] = f5
        explanation_parts.append(
            f"KYC risk: {f5}/10 "
            f"({'verified' if customer.kyc_verified else 'NOT verified'})"
        )

        # ── Composite score ───────────────────────────────────────────────
        raw_score = f1 + f2 + f3 + f4 + f5
        score = min(max(raw_score, 0), 100)  # clamp to [0, 100]

        # ── Tier + Decision hint ──────────────────────────────────────────
        if score <= self.LOW_MAX:
            tier = "LOW"
            decision_hint = "ALLOW"
            tier_explanation = "Risk is LOW — action can be executed automatically."
        elif score <= self.MEDIUM_MAX:
            tier = "MEDIUM"
            decision_hint = "ALLOW"
            tier_explanation = "Risk is MEDIUM — action allowed with advisory logging."
        elif score <= self.HIGH_MAX:
            tier = "HIGH"
            decision_hint = "ESCALATE"
            tier_explanation = "Risk is HIGH — requires human agent review before execution."
        else:
            tier = "CRITICAL"
            decision_hint = "DENY"
            tier_explanation = "Risk is CRITICAL — action is automatically denied."

        explanation = (
            f"Risk Score: {score}/100 | Tier: {tier}\n"
            + "\n".join(explanation_parts)
            + f"\nDecision: {tier_explanation}"
        )

        return RiskResult(
            score=score,
            tier=tier,
            decision_hint=decision_hint,
            explanation=explanation,
            factor_scores=factor_scores,
        )
