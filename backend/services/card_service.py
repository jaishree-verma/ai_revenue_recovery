"""
services/card_service.py
------------------------
Business logic for card operations: blocking and replacement requests.
All mutations are only executed AFTER the governance layer issues an ALLOW decision.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from models import Card


# ---------------------------------------------------------------------------
# Lookup
# ---------------------------------------------------------------------------

def get_card_by_id(card_id: int, db: Session) -> Card | None:
    """Fetch a Card record by primary key."""
    return db.query(Card).filter(Card.id == card_id).first()


def get_cards_by_customer(customer_id: int, db: Session) -> list[Card]:
    """Return all cards belonging to a customer."""
    return db.query(Card).filter(Card.customer_id == customer_id).all()


def get_active_card_by_customer(customer_id: int, db: Session) -> Card | None:
    """Return the first ACTIVE card for a customer, or None."""
    return (
        db.query(Card)
        .filter(Card.customer_id == customer_id, Card.card_status == "ACTIVE")
        .first()
    )


# ---------------------------------------------------------------------------
# Card Block
# ---------------------------------------------------------------------------

def block_card(card_id: int, db: Session) -> tuple[bool, str]:
    """
    Set card_status to BLOCKED.
    Returns (success: bool, message: str).
    """
    card = get_card_by_id(card_id, db)
    if card is None:
        return False, f"Card with id={card_id} not found."

    if card.card_status == "BLOCKED":
        return False, "Card is already blocked."

    if card.card_status == "EXPIRED":
        return False, "Cannot block an expired card."

    card.card_status = "BLOCKED"
    card.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(card)
    return True, f"Card {card.card_number_masked} has been successfully blocked."


# ---------------------------------------------------------------------------
# Card Replacement
# ---------------------------------------------------------------------------

def request_card_replacement(card_id: int, db: Session) -> tuple[bool, str]:
    """
    Set card_status to REPLACEMENT_REQUESTED.
    Returns (success: bool, message: str).
    """
    card = get_card_by_id(card_id, db)
    if card is None:
        return False, f"Card with id={card_id} not found."

    if card.card_status == "REPLACEMENT_REQUESTED":
        return False, "A replacement has already been requested for this card."

    card.card_status = "REPLACEMENT_REQUESTED"
    card.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(card)
    return True, f"Replacement request created for card {card.card_number_masked}."
