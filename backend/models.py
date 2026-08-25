"""
models.py
---------
SQLAlchemy ORM models for the AI Revenue Recovery Agent (Razorpay / Amex Track 03).

Tables:
    Customer             — identity, KYC, and risk profile
    Card                 — card metadata and status
    Account              — credit account financials
    RevenueRiskItem      — revenue at risk (payment degradation, checkout drop-off, sub failures, B2B overdue)
    RecoveryIntervention — bounded recovery workflows executed by AI
    AuditLog             — immutable record of every governance & recovery decision
    Escalation           — queue for human recovery specialist handoff
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base


# ---------------------------------------------------------------------------
# Customer / Account Holder
# ---------------------------------------------------------------------------

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    dob = Column(String(10), nullable=False)          # YYYY-MM-DD
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(15), nullable=False)
    pan = Column(String(10), unique=True, nullable=False)
    kyc_verified = Column(Boolean, default=False)
    account_status = Column(String(20), default="ACTIVE")  # ACTIVE | SUSPENDED | CLOSED
    preferred_language = Column(String(20), default="HINGLISH") # ENGLISH | HINGLISH
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    cards = relationship("Card", back_populates="customer", cascade="all, delete-orphan")
    account = relationship("Account", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    revenue_items = relationship("RevenueRiskItem", back_populates="customer", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="customer", cascade="all, delete-orphan")
    escalations = relationship("Escalation", back_populates="customer", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Customer id={self.id} name={self.name} status={self.account_status}>"


# ---------------------------------------------------------------------------
# Card
# ---------------------------------------------------------------------------

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    card_number_masked = Column(String(19), nullable=False)   # e.g. **** **** **** 1234
    card_type = Column(String(20), default="CREDIT")          # CREDIT | DEBIT
    card_status = Column(String(30), default="ACTIVE")        # ACTIVE | BLOCKED | REPLACEMENT_REQUESTED | EXPIRED
    expiry_month = Column(Integer, nullable=False)
    expiry_year = Column(Integer, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="cards")

    def __repr__(self) -> str:
        return f"<Card id={self.id} masked={self.card_number_masked} status={self.card_status}>"


# ---------------------------------------------------------------------------
# Account
# ---------------------------------------------------------------------------

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True, nullable=False)
    credit_limit = Column(Float, default=100000.0)
    available_limit = Column(Float, default=100000.0)
    outstanding_balance = Column(Float, default=0.0)
    account_age_months = Column(Integer, default=0)
    payment_history_score = Column(Integer, default=75) # 0–100 score
    last_fee_reversal_date = Column(DateTime, nullable=True)
    annual_fee_charged = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="account")

    def __repr__(self) -> str:
        return f"<Account id={self.id} limit={self.credit_limit} score={self.payment_history_score}>"


# ---------------------------------------------------------------------------
# RevenueRiskItem  (Track 03 Revenue Loss Records)
# ---------------------------------------------------------------------------

class RevenueRiskItem(Base):
    __tablename__ = "revenue_risk_items"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    title = Column(String(150), nullable=False)
    track_category = Column(String(50), nullable=False) 
    # CATEGORIES: PAYMENT_DEGRADATION | CHECKOUT_DROP_OFF | FAILED_SUBSCRIPTION | B2B_RECEIVABLES | MANDATE_RETRY
    amount_at_risk = Column(Float, nullable=False)
    amount_recovered = Column(Float, default=0.0)
    failure_reason = Column(String(200), nullable=False)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    status = Column(String(30), default="PENDING") 
    # STATUS: PENDING | RECOVERED | PARTIALLY_RECOVERED | HARD_STOPPED | ESCALATED
    stopping_rule_triggered = Column(String(100), nullable=True)
    due_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="revenue_items")
    interventions = relationship("RecoveryIntervention", back_populates="risk_item", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<RevenueRiskItem id={self.id} title={self.title} status={self.status} at_risk={self.amount_at_risk}>"


# ---------------------------------------------------------------------------
# RecoveryIntervention
# ---------------------------------------------------------------------------

class RecoveryIntervention(Base):
    __tablename__ = "recovery_interventions"

    id = Column(Integer, primary_key=True, index=True)
    risk_item_id = Column(Integer, ForeignKey("revenue_risk_items.id"), nullable=False)
    intervention_type = Column(String(50), nullable=False) 
    # TYPES: SMART_RETRY | DYNAMIC_PAYMENT_LINK | HINGLISH_VOICE_CHASER | PROMISE_TO_PAY_PLAN | COMPLIANT_ESCALATION
    details = Column(Text, nullable=True)
    amount_recovered = Column(Float, default=0.0)
    status = Column(String(20), default="EXECUTED") # EXECUTED | STOPPED | ESCALATED
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    risk_item = relationship("RevenueRiskItem", back_populates="interventions")


# ---------------------------------------------------------------------------
# AuditLog  (immutable — no updates, only inserts)
# ---------------------------------------------------------------------------

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    session_id = Column(String(64), nullable=True)
    intent = Column(String(50), nullable=False)       
    # INTENT: checkout_recovery | mandate_sequencer | b2b_receivables_chaser | payment_degradation_fix | fee_reversal
    action = Column(String(100), nullable=False)      
    decision = Column(String(20), nullable=False)     # ALLOW | DENY | ESCALATE
    policy_applied = Column(String(150), nullable=True)
    risk_score = Column(Integer, nullable=True)       # 0–100
    risk_tier = Column(String(20), nullable=True)     # LOW | MEDIUM | HIGH | CRITICAL
    reason = Column(Text, nullable=True)              
    result = Column(String(50), nullable=True)        # SUCCESS | HARD_STOP | ESCALATED
    amount_recovered = Column(Float, default=0.0)
    stopping_rule_triggered = Column(String(150), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} intent={self.intent} decision={self.decision}>"


# ---------------------------------------------------------------------------
# Escalation  (human recovery specialist handoff queue)
# ---------------------------------------------------------------------------

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    audit_log_id = Column(Integer, ForeignKey("audit_logs.id"), nullable=True)
    session_id = Column(String(64), nullable=True)
    intent = Column(String(50), nullable=False)
    conversation_summary = Column(Text, nullable=True)
    risk_score = Column(Integer, nullable=True)
    escalation_reason = Column(Text, nullable=False)
    status = Column(String(20), default="OPEN")  # OPEN | IN_PROGRESS | RESOLVED | CLOSED
    assigned_agent = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="escalations")

    def __repr__(self) -> str:
        return f"<Escalation id={self.id} intent={self.intent} status={self.status}>"
