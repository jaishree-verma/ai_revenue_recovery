"""
api/governance_api.py
----------------------
REST endpoints for the Governance Layer.

Routes:
    POST /governance/evaluate               — run a full governance check
    GET  /governance/audit-logs             — paginated audit log
    GET  /governance/audit-logs/{cust_id}   — customer-specific audit log
    GET  /governance/escalations            — open escalation queue
    PATCH /governance/escalations/{esc_id}  — update escalation status (human agent)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    GovernanceRequest, GovernanceDecision,
    AuditLogListResponse,
    EscalationSchema, EscalationUpdateRequest,
)
from governance.governance import run_governance_checks
from governance.audit_logger import (
    get_audit_logs,
    get_logs_by_customer,
    get_escalations,
)
from models import Escalation

router = APIRouter(prefix="/governance", tags=["Governance"])


# ---------------------------------------------------------------------------
# Governance Evaluation
# ---------------------------------------------------------------------------

@router.post(
    "/evaluate",
    response_model=GovernanceDecision,
    summary="Run governance checks for a service request",
    description=(
        "The primary governance endpoint. Called by every service agent before "
        "executing a customer action. Returns ALLOW, DENY, or ESCALATE with "
        "full explainability and audit trail."
    ),
)
def evaluate_request(
    request: GovernanceRequest,
    db: Session = Depends(get_db),
) -> GovernanceDecision:
    return run_governance_checks(request, db)


# ---------------------------------------------------------------------------
# Audit Logs
# ---------------------------------------------------------------------------

@router.get(
    "/audit-logs",
    response_model=AuditLogListResponse,
    summary="Retrieve all governance audit logs (paginated)",
)
def list_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    return get_audit_logs(db, page=page, page_size=page_size)


@router.get(
    "/audit-logs/{customer_id}",
    response_model=AuditLogListResponse,
    summary="Retrieve audit logs for a specific customer",
)
def list_customer_audit_logs(
    customer_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    return get_logs_by_customer(customer_id, db, page=page, page_size=page_size)


# ---------------------------------------------------------------------------
# Escalations
# ---------------------------------------------------------------------------

@router.get(
    "/escalations",
    response_model=list[EscalationSchema],
    summary="Retrieve the human-agent escalation queue",
)
def list_escalations(
    status: str | None = Query(None, description="Filter by status: OPEN | IN_PROGRESS | RESOLVED"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[EscalationSchema]:
    escalations = get_escalations(db, status=status, page=page, page_size=page_size)
    return [EscalationSchema.model_validate(e) for e in escalations]


@router.patch(
    "/escalations/{escalation_id}",
    response_model=EscalationSchema,
    summary="Update escalation status — for human agents",
)
def update_escalation(
    escalation_id: int,
    update: EscalationUpdateRequest,
    db: Session = Depends(get_db),
) -> EscalationSchema:
    escalation = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if escalation is None:
        raise HTTPException(status_code=404, detail=f"Escalation {escalation_id} not found.")

    if update.status is not None:
        escalation.status = update.status
    if update.assigned_agent is not None:
        escalation.assigned_agent = update.assigned_agent
    if update.resolution_notes is not None:
        escalation.resolution_notes = update.resolution_notes

    db.commit()
    db.refresh(escalation)
    return EscalationSchema.model_validate(escalation)
