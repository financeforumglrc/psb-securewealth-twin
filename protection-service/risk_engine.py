"""
SecureWealth Twin — Wealth Protection Risk Engine
Implements the 7-point cyber-protection rubric from the hackathon PDF
plus behavioral-biometrics and graph-risk bonuses.
"""

import uuid
from typing import List, Literal, Optional

from models import TransactionRequest


def evaluate_wealth_protection(req: TransactionRequest) -> dict:
    risk_score = 0
    factors: List[str] = []

    # 1. Device Trust Check (+20 if new device)
    if not req.is_trusted_device:
        risk_score += 20
        factors.append("Action initiated from an unrecognized/new device.")

    # 2. Login & Session Behaviour (+25 if < 10 seconds)
    if req.seconds_since_login < 10:
        risk_score += 25
        factors.append(f"High-value action taken unusually fast ({req.seconds_since_login}s after login).")

    # 3. Action Amount vs History (+30 if > 2x usual)
    if req.amount > (req.historical_avg_amount * 2):
        risk_score += 30
        factors.append(f"Amount ₹{req.amount:,.0f} is significantly higher than your usual pattern.")

    # 4. OTP Usage Pattern (+15 per extra attempt)
    if req.otp_attempts > 1:
        risk_score += (req.otp_attempts - 1) * 15
        factors.append(f"Multiple OTP attempts detected ({req.otp_attempts} tries).")

    # 5. New Action / Investment Type (+15 if first time)
    if req.is_first_time_investment:
        risk_score += 15
        factors.append("This is a first-time payee or investment type for your account.")

    # 6. Behaviour Consistency Check (+10 per retry/cancel loop)
    if req.retry_count > 0:
        risk_score += req.retry_count * 10
        factors.append(f"Unusual retry/cancel pattern observed ({req.retry_count} retries).")

    # 7. Behavioral biometrics bonus
    biometric_bonus = _biometric_bonus(req.behavioral_deviation or 0.0)
    if biometric_bonus:
        risk_score += biometric_bonus
        factors.append("Behavioral biometrics deviation detected (typing/mouse rhythm mismatch).")

    # 8. Graph / network risk bonus
    graph_bonus = req.graph_risk_bonus or 0
    if graph_bonus:
        risk_score += graph_bonus
        factors.append("Network graph analysis flagged a connection to a known fraud pattern.")

    risk_score = min(risk_score, 100)

    if risk_score < 30:
        level: Literal["LOW", "MEDIUM", "HIGH"] = "LOW"
        action: Literal["ALLOW", "WARN_COOL_OFF", "BLOCK"] = "ALLOW"
        message = "Transaction approved. Stay secure!"
    elif risk_score < 60:
        level = "MEDIUM"
        action = "WARN_COOL_OFF"
        message = (
            "🛡️ Security Pause: For your safety, this action is on a 15-minute cooling-off period. "
            "We have sent an OTP to verify."
        )
    else:
        level = "HIGH"
        action = "BLOCK"
        message = (
            "🛑 Action Temporarily Blocked: Unusual activity detected. "
            "Please contact support or try again in 24 hours."
        )

    if not factors:
        factors.append("No risk signals detected — transaction matches your normal patterns.")

    return {
        "risk_score": risk_score,
        "risk_level": level,
        "action": action,
        "explainable_factors": factors,
        "user_message": message,
        "reference_id": "SWT-" + uuid.uuid4().hex[:10].upper(),
    }


def _biometric_bonus(deviation: float) -> int:
    if deviation > 0.6:
        return 20
    if deviation > 0.35:
        return 10
    return 0
