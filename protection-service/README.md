# SecureWealth Twin — Protection API

FastAPI microservice for the PSB SecureWealth Twin hackathon build.

## Endpoints

- `GET /health` — health check
- `POST /api/v1/protect-wealth-action` — 7-point wealth protection risk scoring
- `POST /api/v1/graph-risk` — NetworkX fraud-ring detection
- `POST /api/v1/biometric-risk` — behavioral biometrics risk bonus
- `GET /api/v1/aa/fetch` — mock Account Aggregator fetch
- `POST /api/v1/guardian-message` — empathetic security message

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
