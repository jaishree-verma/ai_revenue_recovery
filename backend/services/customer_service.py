"""
services/customer_service.py
-----------------------------
Business logic for customer authentication, lookup, and account retrieval.
These functions are called both by API route handlers and by the governance layer.
"""

from sqlalchemy.orm import Session
from models import Customer, Account
from schemas import CustomerAuthResponse


# ---------------------------------------------------------------------------
# Customer Lookup
# ---------------------------------------------------------------------------

def get_customer_by_id(customer_id: int, db: Session) -> Customer | None:
    """Fetch a Customer record by primary key. Returns None if not found."""
    return db.query(Customer).filter(Customer.id == customer_id).first()


def get_account_by_customer_id(customer_id: int, db: Session) -> Account | None:
    """Fetch the Account linked to a customer. Returns None if not found."""
    return db.query(Account).filter(Account.customer_id == customer_id).first()


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

def authenticate_customer(
    customer_id: int,
    dob: str,
    pan: str,
    db: Session
) -> CustomerAuthResponse:
    """
    Verify customer identity using DOB + PAN (MVP approach).

    Returns CustomerAuthResponse with:
        - authenticated: True / False
        - customer_id: set when authenticated
        - message: explanation
    """
    customer = get_customer_by_id(customer_id, db)

    if customer is None:
        return CustomerAuthResponse(
            authenticated=False,
            message="Customer not found."
        )

    if customer.account_status == "CLOSED":
        return CustomerAuthResponse(
            authenticated=False,
            message="Account is closed and cannot be accessed."
        )

    if customer.account_status == "SUSPENDED":
        return CustomerAuthResponse(
            authenticated=False,
            message="Account is suspended. Please contact support."
        )

    # DOB and PAN check (case-insensitive PAN)
    dob_match = customer.dob == dob
    pan_match = customer.pan.upper() == pan.upper()

    if not (dob_match and pan_match):
        return CustomerAuthResponse(
            authenticated=False,
            message="Authentication failed. DOB or PAN did not match."
        )

    return CustomerAuthResponse(
        authenticated=True,
        customer_id=customer.id,
        message="Authentication successful."
    )


# ---------------------------------------------------------------------------
# Authorization
# ---------------------------------------------------------------------------

def is_customer_authorized_for_action(customer: Customer, intent: str) -> tuple[bool, str]:
    """
    Check whether a customer is authorized to request a given action.
    Returns (authorized: bool, reason: str).

    Rules:
        - KYC must be verified for all sensitive actions.
        - Account must be ACTIVE.
    """
    if not customer.kyc_verified:
        return False, "KYC verification is incomplete. Action not permitted."

    if customer.account_status != "ACTIVE":
        return False, f"Account status is '{customer.account_status}'. Only ACTIVE accounts can initiate servicing requests."

    return True, "Customer is authorized."
