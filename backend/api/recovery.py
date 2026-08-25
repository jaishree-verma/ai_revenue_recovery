"""
api/recovery.py
---------------
API endpoints for Track 03 AI Revenue Recovery Platform.

Provides endpoints for:
  - Listing revenue at risk items across all 5 track categories
  - Triggering single-case AI recovery workflow with multi-agent reasoning
  - Executing batch AI recovery workflows with measured money recovered
  - Recording promise-to-pay schedules & Hinglish voice agreements
  - Real-time recovery KPI metrics & ROI statistics
  - Demo state reset utility
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db, Base, engine
import models
import schemas
from governance.governance import run_governance_checks
from schemas import GovernanceRequest, BatchRecoverySummary, PromiseToPayRequest
from ai.agent import AIServicingAgent
from seed_data import seed

router = APIRouter(prefix="/api/recovery", tags=["Revenue Recovery"])
_agent = AIServicingAgent()


@router.get("/items", response_model=List[schemas.RevenueRiskItemSchema])
def get_revenue_risk_items(
    status: Optional[str] = Query(None, description="Filter by status: PENDING | RECOVERED | PARTIALLY_RECOVERED | HARD_STOPPED | ESCALATED"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Retrieve all revenue at risk items."""
    query = db.query(models.RevenueRiskItem)
    if status:
        query = query.filter(models.RevenueRiskItem.status == status)
    if category:
        query = query.filter(models.RevenueRiskItem.track_category == category)
    return query.order_by(models.RevenueRiskItem.id.asc()).all()


@router.post("/execute/{item_id}")
def execute_single_recovery(
    item_id: int,
    db: Session = Depends(get_db)
):
    """
    Execute end-to-end multi-agent AI recovery for a specific revenue risk case.
    """
    item = db.query(models.RevenueRiskItem).filter(models.RevenueRiskItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"Revenue risk item {item_id} not found")

    intent_map = {
        "CHECKOUT_DROP_OFF": "checkout_recovery",
        "FAILED_SUBSCRIPTION": "mandate_sequencer",
        "B2B_RECEIVABLES": "b2b_receivables_chaser",
        "PAYMENT_DEGRADATION": "payment_degradation_fix",
        "MANDATE_RETRY": "mandate_sequencer",
    }
    intent = intent_map.get(item.track_category, "checkout_recovery")

    result = _agent.process_message(
        customer_id=item.customer_id,
        session_id=f"single_exec_item_{item.id}",
        message=f"Execute AI recovery workflow for item #{item.id} ({item.title})",
        db=db
    )

    db.refresh(item)
    return {
        "status": "success",
        "item": {
            "id": item.id,
            "title": item.title,
            "category": item.track_category,
            "amount_at_risk": item.amount_at_risk,
            "amount_recovered": item.amount_recovered,
            "status": item.status,
            "retry_count": item.retry_count,
            "stopping_rule_triggered": item.stopping_rule_triggered
        },
        "agent_result": result
    }


@router.post("/batch", response_model=BatchRecoverySummary)
def execute_batch_recovery(
    payload: schemas.RecoveryBatchRequest,
    db: Session = Depends(get_db)
):
    """
    Execute bounded AI recovery workflow across selected or all pending revenue risk items.
    Calculates measured money recovered, checks stopping rules, and logs audit trails.
    """
    query = db.query(models.RevenueRiskItem)
    if payload.item_ids:
        query = query.filter(models.RevenueRiskItem.id.in_(payload.item_ids))
    
    items = query.all()
    if not items:
        items = db.query(models.RevenueRiskItem).all()

    total_items = len(items)
    total_at_risk = sum(item.amount_at_risk for item in items)
    money_recovered = 0.0
    success_count = 0
    stopped_count = 0
    escalated_count = 0
    audit_logs_count = 0
    category_breakdown = {}

    for item in items:
        intent_map = {
            "CHECKOUT_DROP_OFF": "checkout_recovery",
            "FAILED_SUBSCRIPTION": "mandate_sequencer",
            "B2B_RECEIVABLES": "b2b_receivables_chaser",
            "PAYMENT_DEGRADATION": "payment_degradation_fix",
            "MANDATE_RETRY": "mandate_sequencer",
        }
        intent = intent_map.get(item.track_category, "checkout_recovery")

        gov_req = GovernanceRequest(
            customer_id=item.customer_id,
            session_id=payload.session_id or "batch_run_session",
            intent=intent,
            action=f"batch_recovery_{item.track_category.lower()}",
            risk_item_id=item.id,
            amount_at_risk=item.amount_at_risk,
            offered_discount_pct=5.0 if item.track_category == "CHECKOUT_DROP_OFF" else None,
            conversation_summary=f"Batch AI recovery workflow for item '{item.title}' (₹{item.amount_at_risk:,.2f})"
        )

        decision = run_governance_checks(gov_req, db)
        audit_logs_count += 1

        category_name = item.track_category
        if category_name not in category_breakdown:
            category_breakdown[category_name] = {"at_risk": 0.0, "recovered": 0.0, "count": 0}

        category_breakdown[category_name]["at_risk"] += item.amount_at_risk
        category_breakdown[category_name]["count"] += 1

        if decision.decision == "ALLOW":
            recovered_amount = decision.amount_recovered or item.amount_at_risk
            if item.track_category == "B2B_RECEIVABLES":
                recovered_amount = item.amount_at_risk * 0.50 # 50% upfront promise-to-pay
                item.status = "PARTIALLY_RECOVERED"
            else:
                item.status = "RECOVERED"

            item.amount_recovered = recovered_amount
            item.retry_count += 1

            money_recovered += recovered_amount
            success_count += 1
            category_breakdown[category_name]["recovered"] += recovered_amount

            intervention = models.RecoveryIntervention(
                risk_item_id=item.id,
                intervention_type=f"BATCH_AI_{intent.upper()}",
                details=f"Automated recovery workflow executed successfully via Governance (Policy: {decision.policy_applied}).",
                amount_recovered=recovered_amount,
                status="EXECUTED"
            )
            db.add(intervention)

        elif decision.decision == "ESCALATE":
            item.status = "ESCALATED"
            escalated_count += 1
            intervention = models.RecoveryIntervention(
                risk_item_id=item.id,
                intervention_type="HUMAN_ESCALATION",
                details=f"Escalated to Human Specialist: {decision.reason}",
                amount_recovered=0.0,
                status="ESCALATED"
            )
            db.add(intervention)

        else: # DENY / HARD_STOP
            item.status = "HARD_STOPPED"
            item.stopping_rule_triggered = decision.stopping_rule_triggered or "POLICY_DENIED"
            stopped_count += 1
            intervention = models.RecoveryIntervention(
                risk_item_id=item.id,
                intervention_type="HARD_STOP_CEASE",
                details=f"Intervention stopped by governance: {decision.reason}",
                amount_recovered=0.0,
                status="STOPPED"
            )
            db.add(intervention)

    db.commit()

    recovery_rate = (money_recovered / total_at_risk * 100.0) if total_at_risk > 0 else 0.0

    return BatchRecoverySummary(
        total_items_processed=total_items,
        total_revenue_at_risk=total_at_risk,
        total_money_recovered=money_recovered,
        recovery_rate_percent=round(recovery_rate, 2),
        successful_recoveries=success_count,
        hard_stopped_count=stopped_count,
        escalated_count=escalated_count,
        breakdown_by_category=category_breakdown,
        audit_logs_created=audit_logs_count
    )


@router.post("/promise-to-pay")
def record_promise_to_pay(
    payload: PromiseToPayRequest,
    db: Session = Depends(get_db)
):
    """Record a Promise-to-Pay schedule for B2B receivables."""
    risk_item = db.query(models.RevenueRiskItem).filter(models.RevenueRiskItem.id == payload.risk_item_id).first()
    if not risk_item:
        raise HTTPException(status_code=404, detail="Revenue risk item not found")

    recovered_amount = payload.installment_amount
    risk_item.status = "PARTIALLY_RECOVERED"
    risk_item.amount_recovered += recovered_amount

    intervention = models.RecoveryIntervention(
        risk_item_id=risk_item.id,
        intervention_type="PROMISE_TO_PAY_PLAN",
        details=f"Promise to pay recorded for date {payload.promise_date}. Language: {payload.language}.",
        amount_recovered=recovered_amount,
        status="EXECUTED"
    )
    db.add(intervention)
    db.commit()

    return {
        "status": "success",
        "message": f"Promise to Pay agreement logged for {payload.promise_date}.",
        "amount_promised": payload.installment_amount,
        "language": payload.language
    }


@router.get("/metrics")
def get_recovery_metrics(db: Session = Depends(get_db)):
    """Retrieve aggregate recovery metrics for the revenue dashboard."""
    items = db.query(models.RevenueRiskItem).all()
    total_at_risk = sum(item.amount_at_risk for item in items)
    total_recovered = sum(item.amount_recovered for item in items)
    recovery_rate = (total_recovered / total_at_risk * 100.0) if total_at_risk > 0 else 0.0

    recovered_count = db.query(models.RevenueRiskItem).filter(models.RevenueRiskItem.status.in_(["RECOVERED", "PARTIALLY_RECOVERED"])).count()
    stopped_count = db.query(models.RevenueRiskItem).filter(models.RevenueRiskItem.status == "HARD_STOPPED").count()
    escalated_count = db.query(models.RevenueRiskItem).filter(models.RevenueRiskItem.status == "ESCALATED").count()
    pending_count = db.query(models.RevenueRiskItem).filter(models.RevenueRiskItem.status == "PENDING").count()
    active_interventions = db.query(models.RecoveryIntervention).count()

    return {
        "total_revenue_at_risk": total_at_risk,
        "total_money_recovered": total_recovered,
        "recovery_rate_percent": round(recovery_rate, 2),
        "successful_recoveries": recovered_count,
        "pending_count": pending_count,
        "hard_stopped_count": stopped_count,
        "escalated_count": escalated_count,
        "active_interventions_count": active_interventions,
        "items_count": len(items)
    }


@router.post("/reset")
def reset_recovery_data(db: Session = Depends(get_db)):
    """Reset database to fresh seed state for interactive demo."""
    db.close()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed()
    return {"status": "success", "message": "Demo data reset successfully."}
