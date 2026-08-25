"""
api/customer.py
---------------
Customer lookup and authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import CustomerSchema, CustomerAuthRequest, CustomerAuthResponse, AccountSchema
from services.customer_service import (
    get_customer_by_id,
    get_account_by_customer_id,
    authenticate_customer,
)

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get(
    "/{customer_id}",
    response_model=CustomerSchema,
    summary="Get customer profile by ID",
)
def get_customer(customer_id: int, db: Session = Depends(get_db)) -> CustomerSchema:
    customer = get_customer_by_id(customer_id, db)
    if customer is None:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found.")
    return CustomerSchema.model_validate(customer)


@router.get(
    "/{customer_id}/account",
    response_model=AccountSchema,
    summary="Get account details for a customer",
)
def get_account(customer_id: int, db: Session = Depends(get_db)) -> AccountSchema:
    account = get_account_by_customer_id(customer_id, db)
    if account is None:
        raise HTTPException(status_code=404, detail=f"Account for customer {customer_id} not found.")
    return AccountSchema.model_validate(account)


@router.post(
    "/authenticate",
    response_model=CustomerAuthResponse,
    summary="Authenticate a customer using DOB and PAN",
)
def authenticate(
    request: CustomerAuthRequest,
    db: Session = Depends(get_db),
) -> CustomerAuthResponse:
    return authenticate_customer(
        customer_id=request.customer_id,
        dob=request.dob,
        pan=request.pan,
        db=db,
    )
