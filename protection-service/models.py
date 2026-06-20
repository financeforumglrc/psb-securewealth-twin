from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class TransactionRequest(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    amount: float = Field(..., gt=0, description="Transaction amount in INR")
    historical_avg_amount: float = Field(default=5000.0, description="User's historical average debit amount")
    seconds_since_login: int = Field(default=300, ge=0, description="Seconds elapsed since user login")
    is_trusted_device: bool = Field(default=True, description="Whether the device is trusted")
    otp_attempts: int = Field(default=0, ge=0, description="Number of OTP attempts made")
    is_first_time_investment: bool = Field(default=False, description="True if first-time payee/investment type")
    retry_count: int = Field(default=0, ge=0, description="Number of retry/cancel loops observed")
    behavioral_deviation: Optional[float] = Field(default=0.0, ge=0.0, le=1.0, description="Behavioral biometrics deviation (0-1)")
    graph_risk_bonus: Optional[int] = Field(default=0, ge=0, le=50, description="Extra risk points from graph analysis")


class RiskResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    action: Literal["ALLOW", "WARN_COOL_OFF", "BLOCK"]
    explainable_factors: List[str]
    user_message: str
    reference_id: str


class AAFetchItem(BaseModel):
    bank: str
    type: str
    amount: str
    icon: str


class AAFetchResponse(BaseModel):
    steps: List[AAFetchItem]
    total_net_worth: str
    message: str


class GraphRiskRequest(BaseModel):
    user_id: str
    payee: str
    device_fingerprint: Optional[str] = None


class GraphRiskResponse(BaseModel):
    linked_to_fraud_device: bool
    ring_size: int
    risk_bonus: int
    reason: str


class BiometricRiskRequest(BaseModel):
    deviation: float = Field(..., ge=0.0, le=1.0)


class BiometricRiskResponse(BaseModel):
    risk_bonus: int
    anomaly: Literal["none", "low", "high"]
    reason: str


class GuardianMessageRequest(BaseModel):
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    action: Literal["ALLOW", "WARN_COOL_OFF", "BLOCK"]
    factors: List[str]
    amount: float
    payee: Optional[str] = None


class GuardianMessageResponse(BaseModel):
    message: str
    source: Literal["llm", "template"]
