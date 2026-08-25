"""
governance/governance.py
-------------------------
The Governance Orchestrator — the single entry point for ALL AI Revenue Recovery Agents.

Every recovery action passes through:
  1. Customer existence & Account status check
  2. Stopping rules & Policy evaluation
  3. Risk assessment
  4. Final decision (ALLOW | DENY | ESCALATE)
  5. Audit log write & Escalation creation (if applicable)
"""

from __future__ import annotations
from sqlalchemy.orm import Session

from models import Customer, Account, Card, RevenueRiskItem
from schemas import GovernanceRequest, GovernanceDecision
from services.customer_service import get_customer_by_id, get_account_by_customer_id
from services.card_service import get_active_card_by_customer
from governance.policy_engine import PolicyEngine
from governance.risk_engine import RiskEngine
from governance.audit_logger import log_governance_action, create_escalation


_policy_engine = PolicyEngine()
_risk_engine = RiskEngine()


def run_governance_checks(
    request: GovernanceRequest,
    db: Session,
) -> GovernanceDecision:
    """
    Execute the full governance and stopping rules pipeline for a recovery request.
    """
    explainability_steps: list[str] = []

    # ── Step 1: Customer existence ────────────────────────────────────────
    customer: Customer | None = get_customer_by_id(request.customer_id, db)
    if customer is None:
        return _deny(
            request=request,
            reason=f"Customer with id={request.customer_id} does not exist.",
            policy_applied="GOVERNANCE_CUSTOMER_NOT_FOUND",
            explainability="Step 1: Customer lookup failed — no record found.",
            db=db,
        )
    explainability_steps.append(
        f"Step 1: Account Holder {customer.name} (id={customer.id}) validated ✓"
    )

    # ── Step 2: Fetch supporting data & Revenue Item ─────────────────────
    account: Account | None = get_account_by_customer_id(request.customer_id, db)
    card: Card | None = get_active_card_by_customer(request.customer_id, db)
    risk_item: RevenueRiskItem | None = None
    if request.risk_item_id:
        risk_item = db.query(RevenueRiskItem).filter(RevenueRiskItem.id == request.risk_item_id).first()

    # ── Step 3: Policy Evaluation & Stopping Rules ──────────────────────
    policy_result = _policy_engine.evaluate(
        intent=request.intent,
        customer=customer,
        account=account,
        card=card,
        risk_item=risk_item,
        offered_discount_pct=request.offered_discount_pct,
    )
    explainability_steps.append(
        f"Step 2 (Policy & Stopping Rules): {policy_result.policy_applied} — "
        f"{'PASSED' if policy_result.passed else 'FAILED / HARD STOP'}\n{policy_result.details}"
    )

    if not policy_result.passed:
        if policy_result.stopping_rule_triggered == "COMPLIANCE_AMOUNT_CAP":
            return _escalate(
                request=request,
                reason=policy_result.reason,
                policy_applied=policy_result.policy_applied,
                explainability="\n".join(explainability_steps),
                db=db,
            )
        return _deny(
            request=request,
            reason=policy_result.reason,
            policy_applied=policy_result.policy_applied,
            stopping_rule_triggered=policy_result.stopping_rule_triggered,
            explainability="\n".join(explainability_steps),
            db=db,
        )

    # ── Step 4: Risk Assessment ──────────────────────────────────────────
    risk_result = _risk_engine.evaluate(
        customer=customer,
        account=account,
        intent=request.intent,
    )
    explainability_steps.append(
        f"Step 3 (Risk Score): Score={risk_result.score} Tier={risk_result.tier}\n{risk_result.explanation}"
    )

    # Calculate estimated money recovered
    amount_recovered = 0.0
    if risk_item:
        amount_recovered = request.amount_at_risk or risk_item.amount_at_risk
        if request.offered_discount_pct:
            amount_recovered = amount_recovered * (1 - (request.offered_discount_pct / 100.0))

    # ── Step 5: Final Governance Outcome ─────────────────────────────────
    if risk_result.decision_hint == "DENY":
        return _deny(
            request=request,
            reason=f"Recovery denied due to CRITICAL risk tier. Risk score: {risk_result.score}/100.",
            policy_applied=policy_result.policy_applied,
            risk_score=risk_result.score,
            risk_tier=risk_result.tier,
            explainability="\n".join(explainability_steps),
            db=db,
        )

    if risk_result.decision_hint == "ESCALATE":
        return _escalate(
            request=request,
            reason=f"Recovery escalated to Human Specialist due to HIGH risk tier (Score: {risk_result.score}/100).",
            policy_applied=policy_result.policy_applied,
            risk_score=risk_result.score,
            risk_tier=risk_result.tier,
            explainability="\n".join(explainability_steps),
            db=db,
        )

    # ALLOW
    return _allow(
        request=request,
        reason=f"Recovery intervention approved. Risk score: {risk_result.score}/100 ({risk_result.tier}).",
        policy_applied=policy_result.policy_applied,
        risk_score=risk_result.score,
        risk_tier=risk_result.tier,
        amount_recovered=amount_recovered,
        explainability="\n".join(explainability_steps),
        db=db,
    )


# ---------------------------------------------------------------------------
# Internal Helpers
# ---------------------------------------------------------------------------

def _allow(
    request: GovernanceRequest,
    reason: str,
    policy_applied: str,
    db: Session,
    risk_score: int | None = None,
    risk_tier: str | None = None,
    amount_recovered: float = 0.0,
    explainability: str = "",
) -> GovernanceDecision:
    decision = GovernanceDecision(
        decision="ALLOW",
        reason=reason,
        policy_applied=policy_applied,
        risk_score=risk_score,
        risk_tier=risk_tier,
        amount_recovered=amount_recovered,
        explainability=explainability,
    )
    log = log_governance_action(request, decision, result="SUCCESS", db=db)
    decision.audit_log_id = log.id
    return decision


def _deny(
    request: GovernanceRequest,
    reason: str,
    policy_applied: str,
    db: Session,
    stopping_rule_triggered: str | None = None,
    risk_score: int | None = None,
    risk_tier: str | None = None,
    explainability: str = "",
) -> GovernanceDecision:
    decision = GovernanceDecision(
        decision="DENY",
        reason=reason,
        policy_applied=policy_applied,
        stopping_rule_triggered=stopping_rule_triggered,
        risk_score=risk_score,
        risk_tier=risk_tier,
        amount_recovered=0.0,
        explainability=explainability,
    )
    log = log_governance_action(request, decision, result="HARD_STOP" if stopping_rule_triggered else "FAILED", db=db)
    decision.audit_log_id = log.id
    return decision


def _escalate(
    request: GovernanceRequest,
    reason: str,
    policy_applied: str,
    db: Session,
    risk_score: int | None = None,
    risk_tier: str | None = None,
    explainability: str = "",
) -> GovernanceDecision:
    decision = GovernanceDecision(
        decision="ESCALATE",
        reason=reason,
        policy_applied=policy_applied,
        risk_score=risk_score,
        risk_tier=risk_tier,
        amount_recovered=0.0,
        explainability=explainability,
    )
    log = log_governance_action(request, decision, result="ESCALATED", db=db)
    escalation = create_escalation(request, decision, audit_log_id=log.id, db=db)
    decision.audit_log_id = log.id
    decision.escalation_id = escalation.id
    return decision
