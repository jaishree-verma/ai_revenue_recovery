"""
seed_data.py
------------
Populate the database with test customers and Revenue Risk Items across all 5 Track 03 categories:
1. Checkout Drop-Off & Abandonment (Priya Sharma - High value cart drop)
2. Failed Subscription & Mandate Retry (Rahul Mehta - SaaS sub recurring fail)
3. B2B Overdue Receivables (Anita Kapoor - Corporate invoice overdue)
4. Payment Gateway Degradation (Vikramaditya Singh - High-value auth timeout)
5. Fraud & Stopping Rule Lockout (Rohan Das - Account fraud warning)

Run once or on startup:
    python seed_data.py
"""

from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
import models


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Guard — re-seed if table has fewer than 8 customers
    if db.query(models.Customer).count() >= 8 and db.query(models.RevenueRiskItem).count() >= 5:
        print("Database already seeded with customers and revenue risk items. Skipping.")
        db.close()
        return

    # Clear old data if partial
    db.close()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ── Customer 1: Priya Sharma (Checkout Abandonment) ─────────────────
    priya = models.Customer(
        name="Priya Sharma",
        dob="1990-05-15",
        email="priya.sharma@example.com",
        phone="9876543210",
        pan="ABCDE1234F",
        kyc_verified=True,
        account_status="ACTIVE",
        preferred_language="HINGLISH"
    )
    db.add(priya)
    db.flush()

    priya_card = models.Card(
        customer_id=priya.id,
        card_number_masked="**** **** **** 1001",
        card_type="CREDIT",
        card_status="ACTIVE",
        expiry_month=12,
        expiry_year=2028,
    )
    db.add(priya_card)

    priya_account = models.Account(
        customer_id=priya.id,
        credit_limit=200000.0,
        available_limit=150000.0,
        outstanding_balance=50000.0,
        account_age_months=24,
        payment_history_score=88,
        annual_fee_charged=5000.0,
    )
    db.add(priya_account)

    item_priya = models.RevenueRiskItem(
        customer_id=priya.id,
        title="High-Value Electronics Checkout Abandoned",
        track_category="CHECKOUT_DROP_OFF",
        amount_at_risk=24990.0,
        amount_recovered=0.0,
        failure_reason="OTP Timeout during 3DS Verification",
        retry_count=0,
        max_retries=3,
        status="PENDING",
        due_date="2026-08-24"
    )
    db.add(item_priya)

    # ── Customer 2: Rahul Mehta (Failed Subscription Mandate) ─────────────
    rahul = models.Customer(
        name="Rahul Mehta",
        dob="1985-11-22",
        email="rahul.mehta@example.com",
        phone="9123456780",
        pan="FGHIJ5678K",
        kyc_verified=True,
        account_status="ACTIVE",
        preferred_language="HINGLISH"
    )
    db.add(rahul)
    db.flush()

    rahul_card = models.Card(
        customer_id=rahul.id,
        card_number_masked="**** **** **** 2002",
        card_type="CREDIT",
        card_status="ACTIVE",
        expiry_month=6,
        expiry_year=2027,
    )
    db.add(rahul_card)

    rahul_account = models.Account(
        customer_id=rahul.id,
        credit_limit=100000.0,
        available_limit=10000.0,
        outstanding_balance=90000.0,
        account_age_months=8,
        payment_history_score=52,
        annual_fee_charged=5000.0,
    )
    db.add(rahul_account)

    item_rahul = models.RevenueRiskItem(
        customer_id=rahul.id,
        title="SaaS Enterprise Monthly Subscription Recurring Billing",
        track_category="FAILED_SUBSCRIPTION",
        amount_at_risk=12500.0,
        amount_recovered=0.0,
        failure_reason="Auto-debit Mandate Soft Reject: Card Expiry Approaching",
        retry_count=1,
        max_retries=3,
        status="PENDING",
        due_date="2026-08-20"
    )
    db.add(item_rahul)

    # ── Customer 3: Anita Kapoor (B2B Overdue Receivables) ───────────────
    anita = models.Customer(
        name="Anita Kapoor",
        dob="1995-03-30",
        email="anita.kapoor@example.com",
        phone="9988776655",
        pan="LMNOP9012Q",
        kyc_verified=True,
        account_status="ACTIVE",
        preferred_language="HINGLISH"
    )
    db.add(anita)
    db.flush()

    anita_card = models.Card(
        customer_id=anita.id,
        card_number_masked="**** **** **** 3003",
        card_type="CREDIT",
        card_status="ACTIVE",
        expiry_month=3,
        expiry_year=2026,
    )
    db.add(anita_card)

    anita_account = models.Account(
        customer_id=anita.id,
        credit_limit=500000.0,
        available_limit=100000.0,
        outstanding_balance=400000.0,
        account_age_months=18,
        payment_history_score=70,
        annual_fee_charged=2500.0,
    )
    db.add(anita_account)

    item_anita = models.RevenueRiskItem(
        customer_id=anita.id,
        title="B2B Wholesale Vendor Supply Invoice #INV-8891",
        track_category="B2B_RECEIVABLES",
        amount_at_risk=85000.0,
        amount_recovered=0.0,
        failure_reason="Overdue 15 Days: Working Capital Cashflow Delay",
        retry_count=2,
        max_retries=3,
        status="PENDING",
        due_date="2026-08-09"
    )
    db.add(item_anita)

    # ── Customer 4: Vikramaditya Singh (Payment Gateway Degradation) ──────
    vikram = models.Customer(
        name="Vikramaditya Singh",
        dob="1978-08-10",
        email="vikramaditya.singh@example.com",
        phone="9811223344",
        pan="VIPNO9999V",
        kyc_verified=True,
        account_status="ACTIVE",
        preferred_language="ENGLISH"
    )
    db.add(vikram)
    db.flush()

    vikram_card = models.Card(
        customer_id=vikram.id,
        card_number_masked="**** **** **** 8888",
        card_type="CREDIT",
        card_status="ACTIVE",
        expiry_month=10,
        expiry_year=2030,
    )
    db.add(vikram_card)

    vikram_account = models.Account(
        customer_id=vikram.id,
        credit_limit=1000000.0,
        available_limit=850000.0,
        outstanding_balance=150000.0,
        account_age_months=60,
        payment_history_score=95,
        annual_fee_charged=10000.0,
    )
    db.add(vikram_account)

    item_vikram = models.RevenueRiskItem(
        customer_id=vikram.id,
        title="Luxury Travel Booking & Centurion Concierge",
        track_category="PAYMENT_DEGRADATION",
        amount_at_risk=250000.0,
        amount_recovered=0.0,
        failure_reason="Acquiring Bank Gateway Timeout (Network Switch Outage)",
        retry_count=0,
        max_retries=3,
        status="PENDING",
        due_date="2026-08-24"
    )
    db.add(item_vikram)

    # ── Customer 5: Rohan Das (Fraud Lockout / Hard Stop) ─────────────────
    rohan = models.Customer(
        name="Rohan Das",
        dob="1992-01-19",
        email="rohan.das@example.com",
        phone="9765432109",
        pan="ROHAN1122D",
        kyc_verified=True,
        account_status="SUSPENDED",
        preferred_language="HINGLISH"
    )
    db.add(rohan)
    db.flush()

    rohan_card = models.Card(
        customer_id=rohan.id,
        card_number_masked="**** **** **** 4004",
        card_type="CREDIT",
        card_status="BLOCKED",
        expiry_month=5,
        expiry_year=2025,
    )
    db.add(rohan_card)

    rohan_account = models.Account(
        customer_id=rohan.id,
        credit_limit=150000.0,
        available_limit=3000.0,
        outstanding_balance=147000.0,
        account_age_months=4,
        payment_history_score=35,
        annual_fee_charged=3500.0,
    )
    db.add(rohan_account)

    item_rohan = models.RevenueRiskItem(
        customer_id=rohan.id,
        title="Electronics Store Installment Due #ERR-7721",
        track_category="MANDATE_RETRY",
        amount_at_risk=45000.0,
        amount_recovered=0.0,
        failure_reason="Account Flagged Fraud / Maximum Failed Retries Exceeded",
        retry_count=3,
        max_retries=3,
        status="PENDING",
        due_date="2026-08-01"
    )
    db.add(item_rohan)

    # ── Customer 6: Meera Nair ───────────────────────────────────────────
    meera = models.Customer(
        name="Meera Nair",
        dob="1968-07-04",
        email="meera.nair@example.com",
        phone="9844556677",
        pan="NAIRM3456N",
        kyc_verified=True,
        account_status="ACTIVE",
        preferred_language="HINGLISH"
    )
    db.add(meera)
    db.flush()

    meera_card = models.Card(
        customer_id=meera.id,
        card_number_masked="**** **** **** 5005",
        card_type="CREDIT",
        card_status="ACTIVE",
        expiry_month=8,
        expiry_year=2027,
    )
    db.add(meera_card)

    meera_account = models.Account(
        customer_id=meera.id,
        credit_limit=300000.0,
        available_limit=190000.0,
        outstanding_balance=110000.0,
        account_age_months=84,
        payment_history_score=76,
        annual_fee_charged=7500.0,
    )
    db.add(meera_account)

    item_meera = models.RevenueRiskItem(
        customer_id=meera.id,
        title="Enterprise Cloud Infrastructure Annual Contract #CORP-9901",
        track_category="B2B_RECEIVABLES",
        amount_at_risk=650000.0,
        amount_recovered=0.0,
        failure_reason="Invoice Overdue 45 Days (Exceeds ₹5,00,000 Autonomous Cap)",
        retry_count=0,
        max_retries=3,
        status="PENDING",
        due_date="2026-07-15"
    )
    db.add(item_meera)

    # ── Customer 7: Arjun Bose ───────────────────────────────────────────
    arjun = models.Customer(
        name="Arjun Bose",
        dob="2000-03-12",
        email="arjun.bose@example.com",
        phone="9012345678",
        pan="BOSEA7788B",
        kyc_verified=True,
        account_status="ACTIVE",
        preferred_language="ENGLISH"
    )
    db.add(arjun)
    db.flush()

    arjun_card = models.Card(
        customer_id=arjun.id,
        card_number_masked="**** **** **** 6006",
        card_type="CREDIT",
        card_status="ACTIVE",
        expiry_month=11,
        expiry_year=2028,
    )
    db.add(arjun_card)

    arjun_account = models.Account(
        customer_id=arjun.id,
        credit_limit=30000.0,
        available_limit=12000.0,
        outstanding_balance=18000.0,
        account_age_months=3,
        payment_history_score=61,
        annual_fee_charged=1500.0,
    )
    db.add(arjun_account)

    # ── Customer 8: Sneha Patel ──────────────────────────────────────────
    sneha = models.Customer(
        name="Sneha Patel",
        dob="1987-12-25",
        email="sneha.patel@example.com",
        phone="9567890123",
        pan="PATLS5544P",
        kyc_verified=True,
        account_status="ACTIVE",
        preferred_language="HINGLISH"
    )
    db.add(sneha)
    db.flush()

    sneha_card = models.Card(
        customer_id=sneha.id,
        card_number_masked="**** **** **** 7007",
        card_type="CREDIT",
        card_status="ACTIVE",
        expiry_month=4,
        expiry_year=2030,
    )
    db.add(sneha_card)

    sneha_account = models.Account(
        customer_id=sneha.id,
        credit_limit=500000.0,
        available_limit=420000.0,
        outstanding_balance=80000.0,
        account_age_months=48,
        payment_history_score=91,
        annual_fee_charged=8000.0,
    )
    db.add(sneha_account)

    item_sneha = models.RevenueRiskItem(
        customer_id=sneha.id,
        title="D2C Fashion Cart Drop-off #CHK-3312",
        track_category="CHECKOUT_DROP_OFF",
        amount_at_risk=18900.0,
        amount_recovered=0.0,
        failure_reason="Checkout Page Exit during UPI Intent Redirect",
        retry_count=0,
        max_retries=3,
        status="PENDING",
        due_date="2026-08-25"
    )
    db.add(item_sneha)

    db.commit()
    print("[OK] Seed data inserted successfully for Revenue Recovery Agent (Track 03):")
    print(f"   Item 1: Checkout Abandonment - Priya Sharma (Rs 24,990)")
    print(f"   Item 2: Subscription Mandate Fail - Rahul Mehta (Rs 12,500)")
    print(f"   Item 3: B2B Overdue Invoice - Anita Kapoor (Rs 85,000)")
    print(f"   Item 4: Gateway Degradation - Vikramaditya Singh (Rs 2,50,000)")
    print(f"   Item 5: Fraud Lockout / Hard Stop - Rohan Das (Rs 45,000)")
    print(f"   Item 6: High-Value B2B Escalation - Meera Nair (Rs 6,50,000)")
    print(f"   Item 7: D2C Checkout Drop - Sneha Patel (Rs 18,900)")
    db.close()


if __name__ == "__main__":
    seed()
