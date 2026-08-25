"""
governance/audit_logger.py
---------------------------
All governance and recovery decisions are written to the AuditLog table immediately after
the decision is made, regardless of outcome (ALLOW / DENY / ESCALATE).

The log is append-only — rows are never updated or deleted.
For ESCALATE decisions, an Escalation row is also written for human specialist handoff.
"""

from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Session
from models import AuditLog, Escalation
from schemas import GovernanceRequest, GovernanceDecision, AuditLogSchema, AuditLogListResponse


def log_governance_action(
    request: GovernanceRequest,
    decision: GovernanceDecision,
    result: str,
    db: Session,
) -> AuditLog:
    """
    Persist a governance decision to the AuditLog table.
    """
    log_entry = AuditLog(
        customer_id=request.customer_id,
        session_id=request.session_id,
        intent=request.intent,
        action=request.action,
        decision=decision.decision,
        policy_applied=decision.policy_applied,
        risk_score=decision.risk_score,
        risk_tier=decision.risk_tier,
        reason=decision.reason,
        result=result,
        amount_recovered=decision.amount_recovered,
        stopping_rule_triggered=decision.stopping_rule_triggered,
        timestamp=datetime.utcnow(),
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def create_escalation(
    request: GovernanceRequest,
    decision: GovernanceDecision,
    audit_log_id: int,
    db: Session,
) -> Escalation:
    """
    Create an Escalation record when the governance decision is ESCALATE.
    The escalation queue is what the human-agent dashboard reads from.
    """
    escalation = Escalation(
        customer_id=request.customer_id,
        audit_log_id=audit_log_id,
        session_id=request.session_id,
        intent=request.intent,
        conversation_summary=request.conversation_summary,
        risk_score=decision.risk_score,
        escalation_reason=decision.reason,
        status="OPEN",
    )
    db.add(escalation)
    db.commit()
    db.refresh(escalation)
    return escalation


def get_audit_logs(
    db: Session,
    page: int = 1,
    page_size: int = 50,
) -> AuditLogListResponse:
    """
    Paginated audit log retrieval — most recent first.
    """
    offset = (page - 1) * page_size
    total = db.query(AuditLog).count()
    items = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return AuditLogListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[AuditLogSchema.model_validate(item) for item in items],
    )


def get_logs_by_customer(
    customer_id: int,
    db: Session,
    page: int = 1,
    page_size: int = 20,
) -> AuditLogListResponse:
    offset = (page - 1) * page_size
    query = db.query(AuditLog).filter(AuditLog.customer_id == customer_id)
    total = query.count()
    items = (
        query
        .order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return AuditLogListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[AuditLogSchema.model_validate(item) for item in items],
    )


def get_escalations(
    db: Session,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> list[Escalation]:
    offset = (page - 1) * page_size
    query = db.query(Escalation)
    if status:
        query = query.filter(Escalation.status == status)
    return (
        query
        .order_by(Escalation.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
