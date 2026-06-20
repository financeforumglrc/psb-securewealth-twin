"""
SecureWealth Twin — Protection API
FastAPI microservice for hackathon-grade wealth protection.
"""

import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import (
    AAFetchResponse,
    AAFetchItem,
    BiometricRiskRequest,
    BiometricRiskResponse,
    GraphRiskRequest,
    GraphRiskResponse,
    GuardianMessageRequest,
    GuardianMessageResponse,
    RiskResponse,
    TransactionRequest,
)
from risk_engine import evaluate_wealth_protection
from graph_engine import fraud_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("SecureWealth Protection API starting...")
    yield
    print("SecureWealth Protection API shutting down...")


app = FastAPI(
    title="SecureWealth Twin — Protection API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your Surge/Render origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "securewealth-protection"}


@app.post("/api/v1/protect-wealth-action", response_model=RiskResponse)
async def protect_wealth_action(request: TransactionRequest):
    """
    Mandatory Wealth Protection Layer.
    Evaluates cyber-risk before executing any critical wealth action.
    """
    result = evaluate_wealth_protection(request)
    return RiskResponse(**result)


@app.post("/api/v1/graph-risk", response_model=GraphRiskResponse)
async def graph_risk(request: GraphRiskRequest):
    """Analyze whether the payee/device is linked to a known fraud ring."""
    result = fraud_graph.analyze(
        request.user_id, request.payee, request.device_fingerprint
    )
    return GraphRiskResponse(**result)


@app.post("/api/v1/biometric-risk", response_model=BiometricRiskResponse)
async def biometric_risk(request: BiometricRiskRequest):
    """Convert behavioral biometrics deviation into a risk bonus."""
    deviation = request.deviation
    if deviation > 0.6:
        return BiometricRiskResponse(
            risk_bonus=20, anomaly="high", reason="Behavioral profile shows high deviation."
        )
    if deviation > 0.35:
        return BiometricRiskResponse(
            risk_bonus=10, anomaly="low", reason="Behavioral profile shows moderate deviation."
        )
    return BiometricRiskResponse(
        risk_bonus=0, anomaly="none", reason="Behavioral profile matches baseline."
    )


PERSONA_ACCOUNTS = {
    "hni": [
        AAFetchItem(bank="HDFC Bank", type="Family Office Account", amount="₹2,10,00,000", icon="🏦"),
        AAFetchItem(bank="ICICI Direct", type="Equity Portfolio", amount="₹1,85,50,000", icon="💹"),
        AAFetchItem(bank="Bajaj Allianz", type="ULIP Policy", amount="₹78,00,000", icon="🛡️"),
        AAFetchItem(bank="Zerodha", type="International ETFs", amount="₹50,50,000", icon="📈"),
    ],
    "tech": [
        AAFetchItem(bank="SBI", type="Salary Account", amount="₹4,20,000", icon="🏦"),
        AAFetchItem(bank="Zerodha", type="Equity + ETFs", amount="₹95,50,000", icon="💹"),
        AAFetchItem(bank="HDFC Mutual", type="Tax Saver ELSS", amount="₹42,00,000", icon="📈"),
        AAFetchItem(bank="LIC", type="Term + Endowment", amount="₹42,30,000", icon="🛡️"),
    ],
    "business": [
        AAFetchItem(bank="ICICI Current", type="Business Account", amount="₹62,00,000", icon="🏦"),
        AAFetchItem(bank="Axis Mutual", type="Liquid Funds", amount="₹48,00,000", icon="📈"),
        AAFetchItem(bank="Zerodha", type="Equity Portfolio", amount="₹85,00,000", icon="💹"),
        AAFetchItem(bank="HDFC Life", type="Income Replacement", amount="₹50,00,000", icon="🛡️"),
    ],
    "farmer": [
        AAFetchItem(bank="Punjab & Sind Bank", type="Kisan Account", amount="₹3,20,000", icon="🏦"),
        AAFetchItem(bank="PM-KISAN", type="Government Benefit", amount="₹1,20,000", icon="🇮🇳"),
        AAFetchItem(bank="NABARD Deposit", type="Term Deposit", amount="₹8,50,000", icon="📈"),
        AAFetchItem(bank="LIC Jeevan", type="Life Cover", amount="₹15,60,000", icon="🛡️"),
    ],
    "student": [
        AAFetchItem(bank="SBI Youth", type="Student Account", amount="₹42,000", icon="🏦"),
        AAFetchItem(bank="Groww", type="Digital Gold", amount="₹18,000", icon="🪙"),
        AAFetchItem(bank="PPF", type="Small Savings", amount="₹75,000", icon="📈"),
        AAFetchItem(bank="PhonePe", type="Wallet + UPI", amount="₹15,000", icon="📱"),
    ],
    "senior": [
        AAFetchItem(bank="Bank of Baroda", type="Pension Account", amount="₹2,80,000", icon="🏦"),
        AAFetchItem(bank="Post Office", type="Senior Citizen FD", amount="₹22,00,000", icon="📮"),
        AAFetchItem(bank="LIC Pension", type="Annuity Plan", amount="₹12,00,000", icon="🛡️"),
        AAFetchItem(bank="SBI RD", type="Recurring Deposit", amount="₹5,20,000", icon="📈"),
    ],
}


@app.get("/api/v1/aa/fetch", response_model=AAFetchResponse)
async def aa_fetch(persona: Optional[str] = None):
    """Mock Account Aggregator fetch across multiple institutions."""
    steps = PERSONA_ACCOUNTS.get(persona) if persona else None
    if not steps:
        steps = [
            AAFetchItem(bank="State Bank of India (SBI)", type="Savings Account", amount="₹45,200", icon="🏦"),
            AAFetchItem(bank="HDFC Bank", type="Mutual Funds", amount="₹1,20,000", icon="📈"),
            AAFetchItem(bank="Zerodha", type="Equity Portfolio", amount="₹85,500", icon="💹"),
            AAFetchItem(bank="LIC of India", type="Endowment Policy", amount="₹50,000", icon="🛡️"),
        ]
    total = sum(int(x.amount.replace("₹", "").replace(",", "")) for x in steps)
    return AAFetchResponse(
        steps=steps,
        total_net_worth=f"₹{total:,}",
        message=(
            "Welcome back! I've aggregated your unified financial picture. "
            "Your SecureWealth Twin is now monitoring across all linked institutions."
        ),
    )


@app.post("/api/v1/guardian-message", response_model=GuardianMessageResponse)
async def guardian_message(request: GuardianMessageRequest):
    """
    Generate an empathetic, plain-English security message.
    In a production setup this would call an LLM; here we use reliable templates
    so the hackathon demo never breaks on API key issues.
    """
    amount_str = f"₹{request.amount:,.0f}"
    payee_str = request.payee or "this contact"

    if request.action == "ALLOW":
        message = (
            f"✅ Your {amount_str} request to {payee_str} looks safe. "
            "It matches your usual patterns and trusted device."
        )
    elif request.action == "WARN_COOL_OFF":
        message = (
            f"🛡️ Security Pause: I noticed you're moving {amount_str} to {payee_str} "
            "in a way that doesn't quite match your normal habits. "
            "To protect your wealth, I've placed this on a short cooling-off period. "
            "Please verify the OTP I just sent to your registered mobile."
        )
    else:
        message = (
            f"🛑 I can't let this {amount_str} transfer to {payee_str} proceed right now. "
            "Multiple risk signals are active. Please review your recent notifications "
            "or contact support — your money stays safe."
        )

    return GuardianMessageResponse(message=message, source="template")


if __name__ == "__main__:":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
