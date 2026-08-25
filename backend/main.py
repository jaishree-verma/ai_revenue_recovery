"""
main.py
-------
FastAPI application entry point for the AI Revenue Recovery Agent (Razorpay / Amex Track 03).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 — register ORM models

from api.governance_api import router as governance_router
from api.customer import router as customer_router
from api.card import router as card_router
from api.credit_limit import router as credit_limit_router
from api.fee import router as fee_router
from api.chat import router as chat_router
from api.recovery import router as recovery_router
from seed_data import seed

# ---------------------------------------------------------------------------
# Create tables & Auto-seed
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)
try:
    seed()
except Exception as e:
    print(f"Seed execution note: {e}")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Amex & Razorpay AI Revenue Recovery Agent",
    description=(
        "An AI-powered Revenue Recovery Platform for Track 03. "
        "Detects revenue at risk, executes bounded recovery workflows across checkout drop-offs, "
        "subscription failures, B2B overdue invoices, and payment degradations with strict stopping rules, "
        "measured money recovered metrics, and audit trail."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(recovery_router)
app.include_router(governance_router)
app.include_router(customer_router)
app.include_router(card_router)
app.include_router(credit_limit_router)
app.include_router(fee_router)
app.include_router(chat_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "Amex & Razorpay AI Revenue Recovery Agent",
        "track": "Track 03 - AI Revenue Recovery",
        "governance_layer": "active",
        "stopping_rules_enforced": True,
    }