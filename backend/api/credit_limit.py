"""
api/credit_limit.py
--------------------
Credit limit management endpoints.
Increase requests pass through the governance layer.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    AccountSchema,
    CreditLimitIncreaseRequest,
    CreditLimitIncreaseResponse,
    GovernanceRequest,
)
from services.customer_service import get_account_by_customer_id
from services.servicing_service import increase_credit_limit
from governance.governance import run_governance_checks
from models import AuditLog

router = APIRouter(prefix="/credit-limit", tags=["Credit Limit"])


@router.get(
    "/{customer_id}",
    response_model=AccountSchema,
    summary="Get current credit limit details for a customer",
)
def get_credit_limit(customer_id: int, db: Session = Depends(get_db)) -> AccountSchema:
    account = get_account_by_customer_id(customer_id, db)
    if account is None:
        raise HTTPException(status_code=404, detail=f"Account for customer {customer_id} not found.")
    return AccountSchema.model_validate(account)


@router.post(
    "/increase",
    response_model=CreditLimitIncreaseResponse,
    summary="Request a credit limit increase (goes through governance)",
)
def request_credit_limit_increase(
    request: CreditLimitIncreaseRequest,
    db: Session = Depends(get_db),
) -> CreditLimitIncreaseResponse:
    # Build governance request
    gov_request = GovernanceRequest(
        customer_id=request.customer_id,
        session_id=request.session_id,
        intent="credit_limit_increase",
        action="increase_credit_limit",
        requested_limit_increase=request.requested_increase,
        conversation_summary=(
            f"Customer requested a credit limit increase of {request.requested_increase:,.0f}."
        ),
    )

    decision = run_governance_checks(gov_request, db)

    if decision.decision != "ALLOW":
        return CreditLimitIncreaseResponse(
            success=False,
            governance_decision=decision,
            message=decision.reason,
        )

    # Execute the approved action
    success, new_limit, message = increase_credit_limit(
        customer_id=request.customer_id,
        increase_amount=request.requested_increase,
        db=db,
    )

    # Update audit log with final result
    if decision.audit_log_id:
        log = db.query(AuditLog).filter(AuditLog.id == decision.audit_log_id).first()
        if log:
            log.result = "SUCCESS" if success else "FAILED"
            db.commit()

    return CreditLimitIncreaseResponse(
        success=success,
        new_credit_limit=new_limit,
        governance_decision=decision,
        message=message,
    )
