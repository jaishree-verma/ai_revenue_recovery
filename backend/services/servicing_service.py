"""
services/servicing_service.py
------------------------------
Business logic for credit limit increases and annual fee reversals.
Functions here interact directly with the Account model.
They are ONLY called after the governance layer issues an ALLOW decision.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from models import Account
from services.customer_service import get_account_by_customer_id


# ---------------------------------------------------------------------------
# Credit Limit Increase
# ---------------------------------------------------------------------------

def increase_credit_limit(
    customer_id: int,
    increase_amount: float,
    db: Session
) -> tuple[bool, float | None, str]:
    """
    Increase the credit limit and available limit for a customer.
    Returns (success: bool, new_limit: float | None, message: str).
    """
    account = get_account_by_customer_id(customer_id, db)
    if account is None:
        return False, None, "Account not found for this customer."

    old_limit = account.credit_limit
    account.credit_limit += increase_amount
    account.available_limit += increase_amount
    account.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(account)

    return (
        True,
        account.credit_limit,
        f"Credit limit increased from {old_limit:,.0f} to {account.credit_limit:,.0f}."
    )


# ---------------------------------------------------------------------------
# Annual Fee Reversal
# ---------------------------------------------------------------------------

def reverse_annual_fee(
    customer_id: int,
    db: Session
) -> tuple[bool, float | None, str]:
    """
    Reverse the annual fee charged on a customer's account.
    Records the reversal date to enforce the 12-month cooldown.
    Returns (success: bool, amount_reversed: float | None, message: str).
    """
    account = get_account_by_customer_id(customer_id, db)
    if account is None:
        return False, None, "Account not found for this customer."

    if account.annual_fee_charged <= 0:
        return False, None, "No annual fee is outstanding for this account."

    amount_reversed = account.annual_fee_charged
    account.available_limit += amount_reversed   # credit back to available limit
    account.annual_fee_charged = 0.0
    account.last_fee_reversal_date = datetime.utcnow()
    account.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(account)

    return (
        True,
        amount_reversed,
        f"Annual fee of {amount_reversed:,.2f} has been reversed. "
        "Your available credit has been updated."
    )
