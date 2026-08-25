"""
api/fee.py
-----------
Annual fee management endpoints.
Reversal requests pass through the governance layer.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    FeeReversalRequest,
    FeeReversalResponse,
    GovernanceRequest,
    AccountSchema,
)
from services.customer_service import get_account_by_customer_id
from services.servicing_service import reverse_annual_fee
from governance.governance import run_governance_checks
from models import AuditLog

router = APIRouter(prefix="/fee", tags=["Fee Management"])


@router.get(
    "/history/{customer_id}",
    response_model=AccountSchema,
    summary="Get fee history for a customer (via account data)",
)
def get_fee_history(customer_id: int, db: Session = Depends(get_db)) -> AccountSchema:
    account = get_account_by_customer_id(customer_id, db)
    if account is None:
        raise HTTPException(status_code=404, detail=f"Account for customer {customer_id} not found.")
    return AccountSchema.model_validate(account)


@router.post(
    "/reverse",
    response_model=FeeReversalResponse,
    summary="Request annual fee reversal (goes through governance)",
)
def request_fee_reversal(
    request: FeeReversalRequest,
    db: Session = Depends(get_db),
) -> FeeReversalResponse:
    gov_request = GovernanceRequest(
        customer_id=request.customer_id,
        session_id=request.session_id,
        intent="fee_reversal",
        action="reverse_annual_fee",
        conversation_summary=request.reason or "Customer requested annual fee reversal.",
    )

    decision = run_governance_checks(gov_request, db)

    if decision.decision != "ALLOW":
        return FeeReversalResponse(
            success=False,
            governance_decision=decision,
            message=decision.reason,
        )

    success, amount, message = reverse_annual_fee(
        customer_id=request.customer_id,
        db=db,
    )

    if decision.audit_log_id:
        log = db.query(AuditLog).filter(AuditLog.id == decision.audit_log_id).first()
        if log:
            log.result = "SUCCESS" if success else "FAILED"
            db.commit()

    return FeeReversalResponse(
        success=success,
        amount_reversed=amount,
        governance_decision=decision,
        message=message,
    )
