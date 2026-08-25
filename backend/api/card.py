"""
api/card.py
-----------
Card management endpoints: block and replacement.
Both operations call the governance layer first.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import CardSchema, CardActionRequest, CardActionResponse, GovernanceRequest
from services.card_service import (
    get_cards_by_customer,
    get_card_by_id,
    block_card,
    request_card_replacement,
)
from governance.governance import run_governance_checks
from governance.audit_logger import log_governance_action

router = APIRouter(prefix="/cards", tags=["Cards"])


@router.get(
    "/{customer_id}",
    response_model=list[CardSchema],
    summary="Get all cards for a customer",
)
def get_cards(customer_id: int, db: Session = Depends(get_db)) -> list[CardSchema]:
    cards = get_cards_by_customer(customer_id, db)
    return [CardSchema.model_validate(c) for c in cards]


@router.post(
    "/block",
    response_model=CardActionResponse,
    summary="Block a customer's card (goes through governance)",
)
def block_customer_card(
    request: CardActionRequest,
    db: Session = Depends(get_db),
) -> CardActionResponse:
    gov_request = GovernanceRequest(
        customer_id=request.customer_id,
        session_id=request.session_id,
        intent="card_block",
        action="block_card",
    )
    decision = run_governance_checks(gov_request, db)

    if decision.decision != "ALLOW":
        return CardActionResponse(
            success=False,
            card_id=request.card_id,
            governance_decision=decision,
            message=decision.reason,
        )

    success, message = block_card(request.card_id, db)

    # Update audit log result
    if decision.audit_log_id:
        from models import AuditLog
        log = db.query(AuditLog).filter(AuditLog.id == decision.audit_log_id).first()
        if log:
            log.result = "SUCCESS" if success else "FAILED"
            db.commit()

    card = get_card_by_id(request.card_id, db)
    return CardActionResponse(
        success=success,
        card_id=request.card_id,
        new_status=card.card_status if card else None,
        governance_decision=decision,
        message=message,
    )


@router.post(
    "/replace",
    response_model=CardActionResponse,
    summary="Request card replacement (goes through governance)",
)
def replace_customer_card(
    request: CardActionRequest,
    db: Session = Depends(get_db),
) -> CardActionResponse:
    gov_request = GovernanceRequest(
        customer_id=request.customer_id,
        session_id=request.session_id,
        intent="card_replacement",
        action="request_card_replacement",
    )
    decision = run_governance_checks(gov_request, db)

    if decision.decision != "ALLOW":
        return CardActionResponse(
            success=False,
            card_id=request.card_id,
            governance_decision=decision,
            message=decision.reason,
        )

    success, message = request_card_replacement(request.card_id, db)

    if decision.audit_log_id:
        from models import AuditLog
        log = db.query(AuditLog).filter(AuditLog.id == decision.audit_log_id).first()
        if log:
            log.result = "SUCCESS" if success else "FAILED"
            db.commit()

    card = get_card_by_id(request.card_id, db)
    return CardActionResponse(
        success=success,
        card_id=request.card_id,
        new_status=card.card_status if card else None,
        governance_decision=decision,
        message=message,
    )
