# DS Financial — AI-Powered Financial Intelligence Platform

> **India's first patent-protected, AI-powered financial operating system.**
> GST compliance, multi-regime tax optimization, financial modeling, wealth management — all in one platform.

[![CI/CD](https://github.com/psb-securewealth/DS_Financial/actions/workflows/ci.yml/badge.svg)](https://github.com/psb-securewealth/DS_Financial/actions)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Patent Portfolio](https://img.shields.io/badge/patents-47%20filed-orange)](PATENT_BLUEPRINT.md)

---

## 🌟 Features

### 🔬 Patent-Protected Core (7 Filed Patents)

| Patent | Innovation | Status | File |
|--------|-----------|--------|------|
| **PAT-001** | GSTIN Risk Intelligence Validator | ✅ Provisional Filed | `gst-black-mirror-enhanced.js` |
| **PAT-002** | ITC Risk Scanner | ✅ Provisional Filed | `gst-black-mirror-enhanced.js` |
| **PAT-003** | Shell Company Detector | ✅ Provisional Filed | `gst-black-mirror-enhanced.js` |
| **PAT-004** | Multi-Regime Tax Optimizer | ✅ Provisional Filed | `smart-tax-optimizer.js` |
| **PAT-005** | Tax Rate Error Detector | ✅ Provisional Filed | `gst-black-mirror-enhanced.js` |
| **PAT-006** | Missing ITC Recovery Predictor | ✅ Provisional Filed | `gst-black-mirror-enhanced.js` |
| **PAT-007** | Multi-Provider AI Orchestrator | ✅ Provisional Filed | `ai-engine.js` |

### 📊 Financial Modeling
- **DCF** — Discounted Cash Flow with WACC, terminal value, sensitivity tables
- **Comps** — Comparable company analysis with peer selection
- **LBO** — Leveraged buyout modeling with IRR calculations
- **M&A** — Merger models with accretion/dilution analysis
- **Scenario Analysis** — What-if simulations with Monte Carlo
- **Football Field** — Valuation summary chart

### 🧠 AI Engine
- **Multi-Provider** — Google Gemini, Anthropic Claude, OpenAI GPT-4o
- **Failover** — Automatic retry with exponential backoff across providers
- **BYOK** (Bring Your Own Key) — User API keys in localStorage
- **Context-Aware Chat** — Model-aware financial tutoring
- **Cell Explanations** — Hover over any model cell for expert explanations
- **Document Analysis** — PDF uploads with AI extraction
- **Investment Memos** — Auto-generated one-page equity research memos

### 💰 GST Compliance Suite
- **GSTIN Validation** — Format + risk intelligence scoring (0-100)
- **ITC Risk Analysis** — Input Tax Credit risk scoring
- **Shell Company Detection** — Pattern-based supplier risk analysis
- **Tax Rate Verification** — HSN/SAC code rate matching
- **ITC Recovery Prediction** — Missing invoice recovery potential
- **Comprehensive Analysis** — All GST checks in one API call

### 📋 Tax Optimization
- **Old vs New Regime** — Side-by-side comparison
- **Section 80C/80D/80G** — Investment optimization
- **HRA Calculator** — House Rent Allowance exemption
- **Capital Gains** — Short-term & long-term tax calculation
- **Advance Tax** — Quarterly payment scheduling
- **Tax Loss Harvesting** — Portfolio loss optimization
- **Form 16 Analyzer** — PDF-based automatic filing
- **Salary Optimizer** — CTC restructuring recommendations

### 🏦 SecureWealth Banking Suite
- **Accounts** — Multiple account types (savings, FD, current)
- **Transactions** — UPI, NEFT, IMPS, transfers with atomic execution
- **Cards** — Debit/credit card management with limits
- **Bills** — Bill tracking with auto-pay
- **Goals** — Financial goal setting with contribution tracking
- **Loans** — EMI calculation, loan amortization, payment tracking
- **Recurring Payments** — SIPs, auto-debits with portfolio integration
- **Beneficiaries** — Contact management
- **Assets** — Portfolio tracking with liquidity classification
- **Audit Logs** — Complete transaction history
- **Statements** — Downloadable account statements

### 🛡️ SecureWealth Twin (Protection)
- **Real-time Risk Engine** — Multi-factor transaction scoring
- **Device Fingerprinting** — Behavioral biometrics
- **Fraud Graph Analysis** — Network-based fraud detection
- **OTP Verification** — Email-based one-time passwords
- **Cooling-off Periods** — Intelligent transaction delays
- **Guardian Messages** — Explainable AI security alerts

### 🔐 KYC & Account Aggregator
- **PAN Verification** — Format validation
- **Aadhaar Integration** — Masked storage
- **eKYC Workflow** — Verification state machine
- **Setu AA** — Bank account aggregation via Setu bridge
- **Financial Personas** — Demo profiles (HNI, Tech, Business, Farmer, Student, Senior)

### 📱 Developer Tools
- **Interactive API Demo** — Test all endpoints in-browser
- **Swagger/OpenAPI 3.0** — Complete API documentation
- **JavaScript SDK** — Client library for browser/Node
- **Webhooks** — Razorpay payment notifications
- **Rate Limiting** — Per-endpoint request throttling
- **Metrics** — Prometheus-style monitoring endpoints

---

## 🏗️ Architecture

```
dsfinancial.in/
├── frontend/                        # Vite-based frontend
│   ├── index.html                   # Main SPA entry
│   ├── financial-modelling.html     # Financial modeling workspace
│   ├── gst-tools.html               # GST compliance tools
│   ├── tax-portal.html              # Tax calculators
│   ├── gallery.html                 # Public model gallery
│   ├── admin.html                   # Admin dashboard
│   ├── api-demo.html                # API demonstration console
│   ├── gst-black-mirror-enhanced.js # PAT-001 to PAT-006 engine (3035 lines)
│   ├── smart-tax-optimizer.js       # PAT-004 engine (1628 lines)
│   ├── ai-engine.js                 # PAT-007 orchestrator (2288 lines)
│   ├── js/                          # Shared utilities
│   │   ├── api-client.js            # JavaScript SDK
│   │   └── config.js                # Runtime config
│   └── sw.js                        # Service Worker (PWA)
│
├── backend/                         # Express API server
│   ├── server.js                    # Entry point
│   ├── routes/ (21 files)           # API route handlers
│   ├── services/ (16 files)         # Business logic
│   ├── algorithms/ (6 files)        # Patent-protected IP
│   ├── middleware/                   # Auth, error handling, metrics
│   ├── validators/                   # Zod validation schemas
│   ├── config/                       # Swagger, nginx
│   ├── utils/                        # Error classes, helpers
│   ├── models/                       # Database models
│   ├── tests/ (10 files)            # Jest test suite
│   └── seeds/                        # Gallery data
│
├── backend/data/                    # SQLite database
├── backend/logs/                    # Application logs
├── backend/scripts/                 # Migration & admin scripts
│
├── .github/workflows/ci.yml         # GitHub Actions CI/CD
├── docker-compose.yml               # Multi-service orchestration
├── Dockerfile                        # Production container
└── nginx.conf                        # Production reverse proxy
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- SQLite (included via better-sqlite3)
- Redis (optional, for caching)

### Installation

```bash
# Clone
git clone https://github.com/psb-securewealth/DS_Financial.git
cd DS_Financial

# Install all dependencies
npm install
cd backend && npm install && cd ..

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your keys
```

### Run in Development

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev:frontend
```

The API runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

### Run Tests

```bash
cd backend
npm test                    # Unit tests with coverage
npm run test:watch         # Watch mode
```

### Build for Production

```bash
npm run build
npm run start              # Start production server
```

### Docker Deployment

```bash
# Build and start all services
docker-compose -f backend/docker-compose.yml up -d

# Build without Redis/Postgres
docker-compose -f backend/docker-compose.yml up -d api nginx

# Full stack with PostgreSQL
docker-compose -f backend/docker-compose.yml --profile full up -d
```

---

## 📚 API Documentation

Interactive API documentation is available at:

- **Swagger UI:** `https://your-host.com/api/v1/docs`
- **OpenAPI JSON:** `https://your-host.com/api/v1/docs.json`
- **API Demo Console:** Open `api-demo.html` in browser

### Authentication

```javascript
// Register
POST /api/v1/auth/register
{ "email": "user@example.com", "password": "Str0ng!Pass", "name": "John" }

// Login
POST /api/v1/auth/login
{ "email": "user@example.com", "password": "Str0ng!Pass" }

// Use returned token
Authorization: Bearer <accessToken>
```

### Key Endpoints

| Method | Endpoint | Description | Patent |
|--------|----------|-------------|--------|
| GET | `/api/v1/health` | Health check | — |
| GET | `/api/v1/metrics` | API metrics | — |
| POST | `/api/v1/gst/validate-gstin` | Validate GSTIN | PAT-001 |
| POST | `/api/v1/gst/analyze-itc-risk` | ITC risk analysis | PAT-002 |
| POST | `/api/v1/gst/detect-shell-companies` | Shell company detection | PAT-003 |
| POST | `/api/v1/tax/calculate-income-tax` | Tax calculation | PAT-004 |
| POST | `/api/v1/tax/optimize` | Tax optimization | PAT-004 |
| POST | `/api/v1/gst/verify-rates` | Rate verification | PAT-005 |
| POST | `/api/v1/gst/predict-itc-recovery` | ITC recovery prediction | PAT-006 |
| POST | `/api/v1/ai/ask` | Ask AI question | PAT-007 |
| POST | `/api/v1/ai/chat` | Context-aware chat | PAT-007 |
| GET | `/api/v1/banking/dashboard` | Banking dashboard | — |
| GET | `/api/v1/screener/search?q=tata` | Company search | — |
| POST | `/api/v1/protect-wealth-action` | Risk assessment | — |

Full documentation: `https://your-host.com/api/v1/docs`

---

## 🧪 Testing Strategy

| Layer | Tool | Coverage Target | Location |
|-------|------|----------------|----------|
| Unit Tests | Jest | 80%+ | `backend/tests/*.test.js` |
| Integration | Supertest | 70%+ | `backend/tests/` |
| API Tests | Supertest | 90%+ | `backend/tests/*.test.js` |
| Algorithm | Jest | 95%+ | `backend/tests/algorithms.test.js` |

```bash
cd backend
npm test                          # Run all tests
npm test -- --watch               # Watch mode
npm test -- --coverage            # With coverage report
npm test -- --testPathPattern=auth  # Specific test file
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `5000` | API server port |
| `JWT_SECRET` | **Yes** | — | Strong random string (min 32 chars) |
| `DATABASE_URL` | No | — | PostgreSQL URL (uses SQLite if empty) |
| `REDIS_URL` | No | — | Redis connection string |
| `GOOGLE_API_KEY` | No | — | Google Gemini API key |
| `OPENAI_API_KEY` | No | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | — | Anthropic Claude API key |
| `SENDGRID_API_KEY` | No | — | SendGrid for email OTP |
| `RAZORPAY_KEY_ID` | No | — | Razorpay payment gateway |
| `RAZORPAY_KEY_SECRET` | No | — | Razorpay secret |
| `ADMIN_ID` | **Yes** | — | Admin dashboard login |
| `ADMIN_PASSWORD` | **Yes** | — | Admin dashboard password |

---

## 📦 Deployment

### GitHub Pages (Frontend)

The frontend is automatically deployed to GitHub Pages via CI/CD on push to `main`.

### Render (Backend)

The backend is deployed to Render via CI/CD. The Render Blueprint (`render.yaml`) configures the service automatically.

### Surge (Alternative Frontend)

```bash
npm install -g surge
surge --project dist --domain your-domain.surge.sh
```

### Manual Docker Deployment

```bash
# Build and push to registry
docker build -t ds-financial-api:latest backend/
docker tag ds-financial-api:latest ghcr.io/your-org/ds-financial-api:latest
docker push ghcr.io/your-org/ds-financial-api:latest

# Deploy
docker pull ghcr.io/your-org/ds-financial-api:latest
docker run -d -p 5000:5000 --env-file .env ds-financial-api:latest
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS, Vite, Chart.js, SheetJS |
| **Backend** | Node.js, Express 4 |
| **Database** | SQLite (better-sqlite3), PostgreSQL |
| **Cache** | Redis (ioredis) |
| **AI** | Gemini 2.5 Flash, Claude Sonnet 4, GPT-4o |
| **Auth** | JWT (HS256), bcrypt, device fingerprinting |
| **Validation** | Zod |
| **Payments** | Razorpay |
| **Email** | SendGrid, SMTP |
| **AA** | Setu Account Aggregator |
| **Logging** | Winston, Morgan, Pino |
| **Testing** | Jest, Supertest |
| **CI/CD** | GitHub Actions |
| **Container** | Docker, Docker Compose |
| **Proxy** | Nginx |

---

## 📈 Monitoring

- **Metrics Endpoint:** `GET /api/v1/metrics` — request rates, latencies, error rates
- **Database Metrics:** `GET /api/v1/metrics/db` — DB health, size, active connections
- **Health Check:** `GET /api/v1/health` — server status, uptime, memory
- **Admin Dashboard:** `GET /api/v1/admin/status` (Basic Auth) — quota usage, recent errors
- **Structured Logging:** Winston JSON logs with `logs/error.log`, `logs/combined.log`, `logs/metrics.log`

---

## 📄 License

**Proprietary — Patent Pending**

DS Financial Solutions. All rights reserved.

This software and its associated patents (47 filed across 4 phases) are the intellectual property of DS Financial Solutions. Unauthorized reproduction, distribution, or use is prohibited.

See [PATENT_BLUEPRINT.md](PATENT_BLUEPRINT.md) and [PATENT_FILING_PACKAGE.md](PATENT_FILING_PACKAGE.md) for patent details.

---

## 👥 Team

**Ira** — MSc Corporate Finance, University of Galway  
Architect & Lead Developer

---

## 🔗 Links

- **Live Demo:** https://dsfinancial-47556.surge.sh
- **API Docs:** https://psb-securewealth-backend.onrender.com/api/v1/docs
- **Gallery:** https://dsfinancial-47556.surge.sh/gallery.html
- **GitHub:** https://github.com/psb-securewealth/DS_Financial
- **Domain:** https://dsfinancial.in
