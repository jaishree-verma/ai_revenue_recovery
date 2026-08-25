"""
schemas.py
----------
Pydantic v2 request/response schemas for the AI Revenue Recovery Agent (Razorpay / Amex Track 03).

These are the data contracts between:
  - Frontend  ↔  API layer
  - Recovery Interventions  ↔  Governance & Stopping Rules Layer
  - Governance Layer  ↔  Audit logger
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ===========================================================================
# Revenue Recovery Contracts (Track 03)
# ===========================================================================

class RevenueRiskItemSchema(BaseModel):
    id: int
    customer_id: int
    title: str
    track_category: str
    amount_at_risk: float
    amount_recovered: float
    failure_reason: str
    retry_count: int
    max_retries: int
    status: str
    stopping_rule_triggered: Optional[str] = None
    due_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RecoveryInterventionSchema(BaseModel):
    id: int
    risk_item_id: int
    intervention_type: str
    details: Optional[str] = None
    amount_recovered: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RecoveryBatchRequest(BaseModel):
    item_ids: Optional[List[int]] = Field(None, description="Optional list of RevenueRiskItem IDs; if null runs all pending")
    session_id: Optional[str] = "batch_run_session"


class BatchRecoverySummary(BaseModel):
    total_items_processed: int
    total_revenue_at_risk: float
    total_money_recovered: float
    recovery_rate_percent: float
    successful_recoveries: int
    hard_stopped_count: int
    escalated_count: int
    breakdown_by_category: dict
    audit_logs_created: int


class PromiseToPayRequest(BaseModel):
    risk_item_id: int
    promise_date: str = Field(..., description="Date promised to pay YYYY-MM-DD")
    installment_amount: float
    number_of_installments: int = 1
    language: str = "HINGLISH" # ENGLISH | HINGLISH


# ===========================================================================
# Governance Layer Contracts
# ===========================================================================

class GovernanceRequest(BaseModel):
    """
    Payload that every recovery agent sends to the governance layer.
    Contains all context needed to make an ALLOW / DENY / ESCALATE decision.
    """
    customer_id: int
    session_id: Optional[str] = None
    intent: str = Field(
        ...,
        description="One of: checkout_recovery | mandate_sequencer | b2b_receivables_chaser | payment_degradation_fix | fee_reversal"
    )
    action: str = Field(
        ...,
        description="Specific recovery action being requested (e.g. 'smart_mandate_retry', 'hinglish_voice_chaser')"
    )
    risk_item_id: Optional[int] = Field(
        None, description="ID of the revenue risk item being acted upon"
    )
    amount_at_risk: Optional[float] = Field(
        None, description="Amount of revenue at risk"
    )
    offered_discount_pct: Optional[float] = Field(
        None, description="Discount or waiver percentage offered to close recovery"
    )
    conversation_summary: Optional[str] = Field(
        None, description="AI-generated summary of customer interaction"
    )


class GovernanceDecision(BaseModel):
    """
    Structured response from the governance layer.
    decision: ALLOW | DENY | ESCALATE
    """
    decision: str                          # ALLOW | DENY | ESCALATE
    reason: str                            # Human-readable explanation
    policy_applied: Optional[str] = None   # e.g. "POLICY_MAX_RETRY_STOPPING_RULE"
    stopping_rule_triggered: Optional[str] = None # e.g. "RETRY_LIMIT_EXCEEDED"
    risk_score: Optional[int] = None       # 0–100
    risk_tier: Optional[str] = None        # LOW | MEDIUM | HIGH | CRITICAL
    explainability: Optional[str] = None   # Step-by-step reasoning
    amount_recovered: float = 0.0          # Measured money recovered if executed
    escalation_id: Optional[int] = None   # Set when decision == ESCALATE
    audit_log_id: Optional[int] = None    # ID of the written AuditLog row


# ===========================================================================
# Audit Log & Escalation
# ===========================================================================

class AuditLogSchema(BaseModel):
    id: int
    customer_id: int
    session_id: Optional[str]
    intent: str
    action: str
    decision: str
    policy_applied: Optional[str]
    risk_score: Optional[int]
    risk_tier: Optional[str]
    reason: Optional[str]
    result: Optional[str]
    amount_recovered: float = 0.0
    stopping_rule_triggered: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[AuditLogSchema]


class EscalationSchema(BaseModel):
    id: int
    customer_id: int
    audit_log_id: Optional[int]
    session_id: Optional[str]
    intent: str
    conversation_summary: Optional[str]
    risk_score: Optional[int]
    escalation_reason: str
    status: str
    assigned_agent: Optional[str]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EscalationUpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_agent: Optional[str] = None
    resolution_notes: Optional[str] = None


# ===========================================================================
# Customer & Account
# ===========================================================================

class CustomerSchema(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    pan: str
    kyc_verified: bool
    account_status: str
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerAuthRequest(BaseModel):
    customer_id: int
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    pan: str = Field(..., description="PAN card number")


class CustomerAuthResponse(BaseModel):
    authenticated: bool
    customer_id: Optional[int] = None
    message: str


class AccountSchema(BaseModel):
    id: int
    customer_id: int
    credit_limit: float
    available_limit: float
    outstanding_balance: float
    account_age_months: int
    payment_history_score: int
    last_fee_reversal_date: Optional[datetime]
    annual_fee_charged: float

    class Config:
        from_attributes = True


class CardSchema(BaseModel):
    id: int
    customer_id: int
    card_number_masked: str
    card_type: str
    card_status: str
    expiry_month: int
    expiry_year: int

    class Config:
        from_attributes = True


class CardActionRequest(BaseModel):
    customer_id: int
    card_id: int
    session_id: Optional[str] = None
    reason: Optional[str] = None


class CardActionResponse(BaseModel):
    success: bool
    card_id: int
    new_status: Optional[str] = None
    governance_decision: GovernanceDecision
    message: str


class CreditLimitIncreaseRequest(BaseModel):
    customer_id: int
    requested_increase: float = Field(..., gt=0)
    session_id: Optional[str] = None


class CreditLimitIncreaseResponse(BaseModel):
    success: bool
    new_credit_limit: Optional[float] = None
    governance_decision: GovernanceDecision
    message: str


class FeeReversalRequest(BaseModel):
    customer_id: int
    session_id: Optional[str] = None
    reason: Optional[str] = None


class FeeReversalResponse(BaseModel):
    success: bool
    amount_reversed: Optional[float] = None
    governance_decision: GovernanceDecision
    message: str


# ===========================================================================
# Chat API
# ===========================================================================

class ChatMessageRequest(BaseModel):
    customer_id: int
    session_id: str
    message: str


class ChatMessageResponse(BaseModel):
    message: str
    intent: str
    governance_decision: Optional[dict] = None
    action_executed: bool = False
    escalated: bool = False
    amount_recovered: float = 0.0
    data: Optional[dict] = None
    suggested_prompts: Optional[List[str]] = None
