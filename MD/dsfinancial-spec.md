# dsFinancial — Product Specification

**An AI-Powered Financial Modeling Platform for Finance Students**
**Codename:** dsFinancial • **Version:** 1.0 (Build Spec) • **Author:** Ira

---

## 0. TL;DR

dsFinancial is a **web-based, AI-native financial modeling platform** built primarily for MSc/MBA Finance students. It lets a user walk in with a company name (or an uploaded annual report PDF) and walk out with a complete, exportable, textbook-correct financial model — DCF, Comps, three-statement, LBO, M&A, the lot — with an AI tutor that explains every cell, every assumption, and every result in plain English.

The wedge: **India-first data and accounting conventions (Ind-AS, INR, NSE/BSE) plus a global option**, paired with the strongest finance-reasoning AI on the market (Claude). Freemium SaaS: free for one company at a time, paid for unlimited models, real-time data, and Pro AI features.

This document is the build spec. It is opinionated. Where defaults are assumed, they are flagged `[DEFAULT]` so you can override.

---

## 1. Vision & Positioning

### 1.1 The Problem

Finance students (and frankly, junior analysts) spend **70% of their modeling time on plumbing** — finding data, transcribing PDFs into Excel, fixing broken links, rebuilding the same three-statement skeleton — and only **30% on the actual analytical thinking** (assumptions, sensitivities, story). Existing tools split into two camps:

- **Pro tools (Capital IQ, FactSet, Bloomberg, Daloopa):** Brilliant, expensive, locked behind enterprise contracts. Effectively inaccessible to students.
- **Hobbyist tools (Screener.in, Yahoo Finance, Damodaran spreadsheets, generic ChatGPT):** Affordable/free, but fragmented. No single product takes a student from raw filings → working model → presentable output, with AI doing the heavy lifting and a tutor explaining every step.

### 1.2 The Opportunity

A whole generation of Indian and global finance students is learning DCF, LBO, M&A on YouTube tutorials and pirated Excel templates. They will pay ₹300–₹800/month for a tool that makes them feel like a real analyst on day one.

### 1.3 Why Now

- Frontier LLMs (Claude in particular) can now reliably parse a 200-page annual report, extract structured financials, and reason about valuation.
- Static-site hosting (Surge, Vercel) makes shipping cheap.
- Indian fintech adoption + UPI billing makes a sub-$10/month SaaS price viable.

### 1.4 The "Best in World" Thesis

We are not trying to out-feature Bloomberg. We are trying to be **the single most useful tool for a finance student between Day 1 of their MSc and Day 30 of their first analyst job**. If we own that wedge, expansion to early-career professionals, family offices, and SME corporate finance follows naturally.

---

## 2. Target User

### 2.1 Primary Persona — "Ira, MSc Corporate Finance, Year 1"

- 21–27 years old, postgraduate finance student (MSc / MBA Finance).
- Knows the theory: DCF, FCFF, DVM, WACC, capital structure, IFRS/Ind-AS basics, LBO mechanics.
- Struggles with: getting clean data, building error-free three-statement models from scratch, defending assumptions in viva/case interviews.
- Pays for Spotify, Netflix, Notion, Grammarly. Willing to pay ₹400–₹800/month for a tool that materially improves coursework and placement prep.

### 2.2 Secondary Personas (Phase 2)

- Equity research / IB analyst (year 0–2)
- CFA candidate (Level II/III)
- Indian SME founder building a pitch model

### 2.3 Core Jobs-to-be-Done

1. *"Build me a working DCF for [company] in under 5 minutes."*
2. *"Extract last 5 years of financials from this annual report PDF."*
3. *"Tell me, in plain English, why my model is giving a negative terminal value."*
4. *"Compare these three companies on a comps basis."*
5. *"Walk me through this LBO model like my professor would."*

---

## 3. The Five Differentiator Pillars

These are the things that, if any one of them is removed, dsFinancial becomes generic.

1. **Tutor-Mode by Default.** Every output is paired with a "Why?" panel. The AI explains the formula, the assumption, the textbook reference. (Lean: Damodaran, McKinsey *Valuation*, Hull, Ross-Westerfield, IFRS standards.)
2. **India-First, Global-Ready.** Native Ind-AS treatment, Indian tax rates (default 25.17% for new domestic companies, 22% for opted-in regime), INR + Lakh/Crore formatting, NSE/BSE tickers — but with a one-click switch to US-GAAP / IFRS / global tickers.
3. **AI-Native, Not AI-Bolted-On.** AI is not a sidebar chatbot. It is the *primary input method*: paste a filing, ask a question, and the model materializes. Manual entry is the fallback, not the default.
4. **Pedagogically Correct.** Outputs match the conventions students see in textbooks and case competitions — not a black-box "trust me" number. Every model produces a clean two-page PDF that looks like coursework, not a screenshot.
5. **Exportable & Open.** One-click export to Excel (`.xlsx`) with live formulas — not flat values. Students can take the model into their viva, hand it to a professor, or build on it themselves.

---

## 4. Feature Modules

Each module is a self-contained workspace inside the app. The AI layer (Section 5) sits across all of them.

### 4.1 DCF / FCFF Valuation

**Inputs:** Ticker or uploaded financials → revenue, EBIT, tax rate, D&A, CapEx, ΔWC, debt, cash, shares outstanding.

**Engine:**
- Forecast horizon: 5 or 10 years (toggle).
- Free Cash Flow to Firm (FCFF) and Free Cash Flow to Equity (FCFE) — toggle.
- Terminal value: Gordon Growth *and* Exit Multiple methods, shown side-by-side.
- Discount rate: WACC (from Module 4.7) or user override.
- Sensitivity grid: WACC × terminal growth (Module 4.6).

**Outputs:**
- Enterprise Value, Equity Value, intrinsic per-share value.
- "Football field" chart showing range under different assumptions.
- Bridge: EV → Equity → Per Share (visual waterfall).

**Tutor Mode:** Explains why FCFF uses pre-financing cash flows, why we discount at WACC (not Ke), why terminal value typically dominates total EV, and the mid-year convention if enabled.

### 4.2 Comparable Company Analysis (Comps)

**Inputs:** Target company + 3–10 peer tickers (AI can suggest peers based on sector/size).

**Engine:**
- Standard multiples: EV/Revenue, EV/EBITDA, EV/EBIT, P/E, P/B, P/Sales, PEG.
- Industry-specific multiples (toggle): EV/Subscribers (telecom), Price/AUM (asset managers), P/NAV (REITs), etc.
- Median, mean, and quartile statistics per multiple.
- Implied valuation range applied to target.

**Outputs:**
- Sortable, editable peer table.
- Implied EV / share price range chart.
- "Why this peer?" AI explanation per inclusion.

### 4.3 Three-Statement Model (IS, BS, CF)

The core deliverable. Everything ties.

**Inputs:** Historical 3–5 years (extracted from filings or uploaded). Forecast drivers.

**Engine:**
- Income Statement: revenue → EBITDA → EBIT → PBT → PAT, with line-item forecast drivers (e.g. revenue growth %, COGS as % of sales).
- Balance Sheet: working capital schedule, fixed asset schedule (CapEx + D&A roll-forward), debt schedule, equity roll-forward.
- Cash Flow Statement: derived from IS + ΔBS (not entered directly). Balance check enforced.
- IFRS / Ind-AS / US-GAAP toggle for line-item naming.

**Outputs:**
- Three-statement workbook with live links.
- Integrity check panel: "Balance sheet balances ✓ / Cash flow ties to BS cash ✓".
- Common-size and growth-rate views.

**Tutor Mode:** "Why does retained earnings on the BS equal opening RE + PAT − dividends?" Click any cell, get an explanation.

### 4.4 LBO Model

**Inputs:** Target enterprise value, debt/equity capital structure, holding period (typically 5 years), entry/exit multiples, operating assumptions.

**Engine:**
- Sources & Uses table.
- Debt schedule with multiple tranches (senior, mezzanine, revolver), mandatory + optional amortization.
- Interest expense and cash sweep logic.
- Returns: IRR, MoM (Money Multiple), and value-creation bridge (EBITDA growth vs multiple expansion vs deleveraging).

**Outputs:**
- Returns waterfall.
- Sensitivity grid: entry multiple × exit multiple → IRR.
- Sponsor returns commentary in plain English.

### 4.5 M&A / Merger Model

**Inputs:** Acquirer + target financials, deal structure (cash, stock, mix), synergies, financing.

**Engine:**
- Accretion/dilution analysis (EPS pre vs post).
- Pro-forma balance sheet with goodwill calculation (purchase price – net identifiable assets).
- Sensitivity on synergy realization and exchange ratio.

**Outputs:**
- "Is this deal accretive?" headline.
- Goodwill and intangibles bridge.
- Pro-forma three-statement (lite).

### 4.6 Sensitivity & Scenario Analysis

A first-class module, not an afterthought.

**Sensitivity:** Any two-variable grid against any output (default: WACC × g → share price).
**Scenario manager:** Base / Bull / Bear with saved assumption sets.
**Tornado chart:** Shows which input matters most.
**Monte Carlo (Pro):** Run 10,000 simulations with user-defined distributions on key drivers; output a probability distribution for intrinsic value.

### 4.7 Capital Structure & WACC

**Engine:**
- Cost of equity: CAPM by default (Rf + β × ERP); Build-Up method optional.
- Beta: 5-year monthly regression vs index (NIFTY 50 / S&P 500 by region); levered/unlevered/relevered conversions shown.
- Risk-free rate: pulled live from 10Y G-Sec (India) or 10Y Treasury (US).
- Equity risk premium: editable, with Damodaran defaults as starting point.
- Cost of debt: from interest expense / avg debt, or yield on outstanding bonds, or synthetic rating spread (AI-suggested).
- Optimal capital structure visualization (per Traditional Theory and M&M with tax).

**Tutor Mode:** "Why does cost of equity rise with leverage?" → walk-through of M&M Proposition II.

### 4.8 Forecasting & Budgeting

**Engine:**
- Time-series forecasting on revenue/cost line items: AI suggests a method (linear, CAGR-based, ARIMA, Prophet-style seasonality) and explains *why*.
- Driver-based budgeting: build a P&L from volume × price × cost driver primitives.
- Variance analysis: actual vs budget with AI-written commentary.

---

## 5. The AI Layer (Cross-Cutting)

This is what makes the tool defensible. All five capabilities are exposed across every module.

### 5.1 PDF / 10-K / Annual Report Extraction *(Priority #1)*

**Flow:**
1. User uploads a PDF (annual report, 10-K, 20-F).
2. Backend pipeline: (a) text extraction via `pdf-parse` + Camelot for tables, (b) page rasterization for scanned filings, (c) Claude vision/text for structured extraction.
3. Claude outputs a structured JSON: `{income_statement: {...}, balance_sheet: {...}, cash_flow: {...}, notes: {...}}` with per-line-item source page references.
4. User reviews extracted data in a side-by-side viewer (PDF on left, parsed table on right, with confidence scores). Anything below 90% confidence is flagged for human review.
5. One click → financials flow into Module 4.3 (three-statement) and every dependent module.

**Why this is the killer feature:** This is the single biggest time sink in modeling. Doing it well = winning.

### 5.2 Natural Language Q&A *(Priority #2)*

A persistent chat panel scoped to the active model. Examples:

- *"What's the implied EV/EBITDA multiple here?"*
- *"Why is my FCFF negative in year 3?"*
- *"Compare this company's ROCE to its 5-year average."*
- *"What would happen to intrinsic value if WACC moved from 10% to 12%?"*

The Q&A engine has **read access to the current model state** (a JSON snapshot is passed in the prompt context) and can execute small numerical operations. For complex what-ifs, it can propose a sensitivity grid the user can run with one click.

### 5.3 Narrative & Commentary Generation *(Priority #3)*

After a model is built, the user clicks "Generate Investment Memo." Claude produces:
- 1-page executive summary (positioning, valuation, recommendation).
- Key assumption rationale.
- Risk factors (drawn from the 10-K risk section + model sensitivities).
- A pedagogically-styled appendix: "Here's what a CFA charterholder would flag."

Output formats: Markdown (default), exportable to PDF or `.docx`.

### 5.4 Assumption & Forecast Suggestions *(Priority #4)*

When a forecast cell is empty (e.g. "Revenue growth, Year 4"), the AI offers a suggestion with rationale:
> *"Year 4 revenue growth: 11.2%. Based on 5-year historical CAGR of 13.4%, sector average of 9.1%, and management guidance of 10-12% from the latest earnings call."*

User accepts, rejects, or edits. Every accepted suggestion is logged with provenance.

### 5.5 Anomaly Detection & Sanity Checks *(Priority #5)*

A passive layer that runs continuously and flags:
- BS doesn't balance (hard error).
- Cash flow doesn't reconcile.
- Forecasted margins drift outside historical or peer range without explanation.
- Negative terminal values, WACC below g, NCI greater than equity, etc.
- Suspicious peer selections (e.g. wildly different size / sector).

Each flag is one click away from "explain this" via the AI.

### 5.6 *(Cross-cutting)* Tutor Mode

Toggle in the top bar. When ON, every output is annotated with a "Why?" tooltip linking to a 3-sentence explanation and a textbook reference (Damodaran chapter, McKinsey page, etc.). Free tier gets tutor mode on the three-statement model; Pro unlocks it everywhere.

---

## 6. Data Sources & Integration

**Tier 1 — Free (ships with MVP):**
- **NSE/BSE filings:** scrape from `bseindia.com` and `nseindia.com` (compliance: respect robots.txt, throttle, cache).
- **Screener.in proxy:** unofficial but widely used; provides 10-year historicals for Indian listed companies.
- **SEC EDGAR:** free, official, structured (XBRL) → highest-quality US data.
- **Yahoo Finance:** via `yfinance` library — global tickers, daily prices, basic financials.
- **FRED (Federal Reserve):** risk-free rates, macro series.
- **RBI:** India risk-free rate, monetary data.

**Tier 2 — User Upload:**
- PDF annual reports (the AI extraction pipeline, Section 5.1).
- Excel / CSV uploads with column mapping wizard.

**Tier 3 — Paid Pro (Phase 2):**
- Alpha Vantage Premium (~$50/month, intraday + extended fundamentals).
- Polygon.io (institutional-grade US data).
- Refinitiv / FactSet via partnership (long-term).

**Caching strategy:** Aggressive. Fundamentals refresh quarterly. Prices daily. Macro weekly. Reduces API costs and survives source rate limits.

---

## 7. Technical Architecture

### 7.1 Stack Summary

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | **Next.js 14+ (App Router) + TypeScript** | SSR for SEO, RSC for performance, ecosystem maturity. |
| Styling | **Tailwind CSS + shadcn/ui** | Fastest path to polished UI; matches modern SaaS aesthetic. |
| State | **Zustand** for client; **TanStack Query** for server | Lightweight, no Redux boilerplate. |
| Spreadsheet engine | **HyperFormula** (open-source) | Excel-compatible formula engine in JS; supports live recalc on edits. |
| Charts | **Tremor** (dashboards) + **Recharts** (custom) | Tremor for at-a-glance, Recharts for football fields and tornado charts. |
| Backend | **Next.js API routes** + **Python FastAPI microservice** for PDF/quant workloads | Node for orchestration, Python for `pdfplumber`/`pandas`/`numpy`/Monte Carlo. |
| Database | **PostgreSQL via Supabase** | Auth + DB + storage + realtime in one. Free tier generous. |
| File storage | **Supabase Storage** or **Cloudflare R2** | Uploaded PDFs, exported XLSX/PDF outputs. |
| Auth | **Supabase Auth** or **Clerk** | Email + Google + (optional) UPI-aware billing via Razorpay. |
| AI | **Claude API (Anthropic)** — primary | Strongest reasoning on long financial documents; best at structured extraction. See https://docs.claude.com |
| PDF parsing | `pdfplumber` + `Camelot` (tables) + Claude vision (scanned) | Layered fallback. |
| Job queue | **Inngest** or **BullMQ + Redis** | Long-running PDF parses (30s–2min) can't block the request thread. |
| Billing | **Razorpay** (India primary) + **Stripe** (global) | INR-native plus international cards. |
| Deployment | **Vercel** (frontend + API), **Railway/Fly.io** (Python service) | Zero-ops for v1. |
| Monitoring | **Sentry** + **PostHog** | Errors + product analytics. |

### 7.2 Architectural Flow (High Level)

```
[Browser: Next.js UI]
        │
        ▼
[Next.js API routes / Edge functions]  ←──── [Supabase: Auth + Postgres + Storage]
        │
        ├──► [HyperFormula engine in-browser] (live model recalc)
        │
        ├──► [Claude API] (Q&A, narrative, suggestions, anomaly explanations)
        │
        └──► [Python FastAPI service]
                    ├──► PDF extraction pipeline
                    ├──► Monte Carlo / heavy numerics
                    └──► Data refresh jobs (NSE/BSE/EDGAR/Yahoo)
```

### 7.3 Key Engineering Decisions

- **Models stored as JSON, not as cells.** The canonical model is a typed JSON document (revenue forecast, assumptions, etc.). The spreadsheet UI is a *view* over this JSON, not the source of truth. This makes AI manipulation, versioning, and exports clean.
- **Versioning every model.** Every save creates an immutable version. Users can fork, diff, and roll back. This is gold for placement-prep students.
- **Per-cell provenance.** Every value carries metadata: `manual_input | extracted_from_pdf(page=42) | ai_suggested(prompt_id=...) | formula(=A1*B1)`. Auditable end-to-end.

---

## 8. User Experience Flow

### 8.1 First-Run Experience (≤ 90 seconds to value)

1. Land on `dsfinancial.com`. CTA: *"Build a DCF for any company in 5 minutes — free."*
2. Sign up (Google in one click).
3. Onboarding wizard: *"Want to try with a sample company (Reliance Industries) or your own?"*
4. If own: paste ticker (NSE/BSE/NYSE/NASDAQ) **or** drop a PDF.
5. Within 60s: financials extracted, three-statement appears, DCF spins up.
6. AI panel pops: *"Welcome — your model is ready. Want me to walk you through it?"*

### 8.2 Core Workflow — Building a Valuation

```
Pick company → Auto-extract financials → Review & confirm → 
Set assumptions (with AI suggestions) → Run model → 
Sensitivity analysis → Generate memo → Export
```

### 8.3 Navigation Structure

- **Workspace** (left rail): list of saved models, folders.
- **Modules** (top tabs in a workspace): IS/BS/CF · DCF · Comps · LBO · M&A · Sensitivity.
- **AI panel** (right rail, collapsible): Q&A, suggestions, tutor mode.
- **Export bar** (top right): Excel · PDF memo · Share link.

---

## 9. Freemium Monetization

| Tier | Price (₹/$) | Limits | Target |
|---|---|---|---|
| **Free** | ₹0 | 1 active model • 3 PDF extractions/month • DCF + Comps only • Tutor mode on three-statement only • Watermarked PDF export | Acquisition, virality, students before placements |
| **Student Pro** | ₹399/mo (~$5) | Unlimited models • Unlimited PDFs • All modules • Full tutor mode • Clean exports • 30-day model history | Core student paying tier; .edu/.ac verification |
| **Pro** | ₹999/mo (~$12) | Everything in Student Pro + Monte Carlo + API access + priority AI + advanced peer screening + 1-year version history | Working analysts, CFA candidates, early professionals |
| **Team** *(Phase 3)* | ₹2,499/mo per 5 seats | Shared workspaces, comments, deal rooms | Boutique IB / advisory shops, classroom plans |

**Pricing philosophy:** Free tier must be genuinely useful (no crippling). Student Pro is impulse-buy territory. Pro is "this is now my job tool."

**Billing:** Razorpay (UPI/cards/netbanking) for ₹ pricing; Stripe for $ pricing. Annual plans at 2 months free.

---

## 10. Compliance, Trust & Disclaimers

- **Not investment advice.** Every page footer: *"dsFinancial is an educational and analytical tool. Outputs are not investment recommendations. Past performance does not guarantee future results."*
- **Data source attribution.** Every extracted financial line cites its source (filing, page, date).
- **AI transparency.** Every AI-generated value is visibly tagged. Users can always see "This was suggested by AI — accept, reject, or edit."
- **Privacy.** Uploaded documents are user-owned and never used to train models. Encrypted at rest (Supabase default). Deletable on demand.
- **India-specific:** SEBI does not regulate analytical tools per se, but advisory framing must be avoided. Stay strictly on the educational/analytical side of the line. Consult a SEBI-registered IA only if/when paid recommendations are ever introduced (don't).

---

## 11. MVP Scope — Phase 1 (months 1–4)

The smallest version that delivers the "wow" moment.

**In scope:**
- Auth, billing (free + Student Pro only).
- Three-statement model (Module 4.3) with full live recalculation.
- DCF / FCFF (Module 4.1).
- Capital Structure / WACC (Module 4.7) — basic.
- Sensitivity (Module 4.6) — 2D grids only, no Monte Carlo.
- AI Capability #1 (PDF extraction) — full.
- AI Capability #2 (Q&A panel) — full.
- AI Capability #6 (Tutor Mode) — three-statement only.
- Data sources: SEC EDGAR + Yahoo Finance + `screener.in` proxy + user PDF upload.
- Export: Excel + PDF memo.

**Out of scope (Phase 2+):**
- LBO, M&A, Monte Carlo, Comps autopeer-suggestion, narrative generation, team features, API access.

**Success criteria for MVP:** A user who arrives knowing nothing can produce a defensible DCF on a real Indian listed company within 10 minutes of signing up, and convert to Student Pro within 7 days at ≥ 3% conversion.

---

## 12. Roadmap

| Phase | Window | Themes |
|---|---|---|
| **Phase 1 — MVP** | Months 1–4 | 3-statement, DCF, PDF extract, Q&A, Tutor Mode, Student Pro tier |
| **Phase 2 — Breadth** | Months 5–8 | Comps with AI peer suggest, LBO, M&A, Narrative Generation, Anomaly Detection, Pro tier |
| **Phase 3 — Depth** | Months 9–12 | Monte Carlo, advanced multiples, team workspaces, classroom plans, API access |
| **Phase 4 — Distribution** | Year 2 | Mobile app, browser extension (right-click any ticker → model), partnerships with B-schools, CFA Institute alignment |

---

## 13. Success Metrics

**North Star Metric:** *Completed Models per Active User per Week* (CMpAUpW). Captures both engagement (using the tool) and outcome (finishing models, not abandoning).

**Supporting metrics:**
- **Activation:** % of signups who complete first model within 24h. Target: ≥ 40%.
- **Free → Paid conversion:** Target ≥ 3% within 14 days; ≥ 6% within 30 days.
- **Retention:** Week-4 retention of paid users ≥ 70%.
- **AI accept rate:** % of AI suggestions accepted. Target: ≥ 50% (proxy for quality).
- **NPS:** Target ≥ 50 among Student Pro users.

---

## 14. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| LLM hallucinates financial numbers | **Critical** | Always pair AI outputs with source citations; deterministic numerics happen in the engine, not the LLM; anomaly detection layer; user must confirm AI suggestions before they enter the model. |
| NSE/BSE / Screener.in scraping breaks | High | Multi-source fallback; caching; long-term: pay for Alpha Vantage / partner with a licensed data vendor. |
| Indian users churn on $-pricing | Med | Native ₹ pricing via Razorpay from day one. |
| Pro-tool incumbents copy features | Med | Wedge on student persona + India + tutor mode is hard for incumbents to mimic without cannibalizing their enterprise pricing. |
| AI API cost erodes margin | Med | Aggressive caching of extraction results; smaller/cheaper Claude model for routine Q&A, premium model only for extraction and memo generation. |
| Compliance / SEBI gray zone | Low–Med | Strict educational framing; legal review before launch; no "buy/sell" recommendations ever. |

---

## 15. Open Questions (for you to decide before build)

1. **Domain / branding.** Is "dsFinancial" the final name? If yes, lock the `.com` and `.in` domains now.
2. **AI provider lock-in.** Default is Claude API. Comfortable, or want to architect a provider-agnostic layer from day one (slightly slower to ship, more flexible later)?
3. **Co-founder / team.** Solo build, or recruiting 1–2 collaborators (one engineer, one finance content lead)?
4. **Funding posture.** Bootstrap on Student Pro revenue, or raise a small angel round (₹25–₹50L) for runway?
5. **B-school partnership.** University of Galway / Indian B-schools — pursue classroom pilots in Year 1, or wait until Phase 3?

---

## Appendix A — Core Formula Reference

For implementation by the engine team. All formulas in textbook canonical form.

### A.1 Free Cash Flow to Firm
```
FCFF = EBIT × (1 − t) + D&A − CapEx − ΔWorking Capital
```

### A.2 Free Cash Flow to Equity
```
FCFE = FCFF − Interest × (1 − t) + Net Borrowing
     = Net Income + D&A − CapEx − ΔWC + Net Borrowing
```

### A.3 WACC
```
WACC = (E/V) × Ke + (D/V) × Kd × (1 − t)
```
where `V = E + D`, `Ke = Rf + β × ERP`, and `Kd` = effective post-tax cost of debt.

### A.4 Terminal Value — Gordon Growth
```
TV(n) = FCFF(n+1) / (WACC − g)
     = FCFF(n) × (1 + g) / (WACC − g)
```
Sanity: require `WACC > g`; default `g ≤ long-run nominal GDP`.

### A.5 Terminal Value — Exit Multiple
```
TV(n) = EBITDA(n) × ExitMultiple
```

### A.6 Enterprise Value → Equity Value Bridge
```
Equity Value = EV − Total Debt + Cash & Equivalents − Minority Interest − Preferred Stock
Per Share    = Equity Value / Diluted Shares Outstanding
```

### A.7 Dividend Discount Model (Gordon)
```
P₀ = D₁ / (Ke − g)
```

### A.8 Two-Stage DDM
```
P₀ = Σ[D_t / (1+Ke)^t]   for t = 1..n
   + [D_{n+1} / (Ke − g_terminal)] / (1+Ke)^n
```

### A.9 CAPM
```
Ke = Rf + β × (Rm − Rf)
```

### A.10 Hamada Equation (relevering beta)
```
β_levered = β_unlevered × [1 + (1 − t) × (D/E)]
```

### A.11 LBO IRR (high-level)
```
IRR such that: NPV(initial equity invested, exit equity proceeds, holding-period CFs) = 0
MoM = Exit Equity Proceeds / Initial Equity Invested
```

### A.12 Accretion / Dilution (M&A, stock deal)
```
Pro-Forma EPS = (NI_acq + NI_target + After-tax Synergies − After-tax Cost of Financing)
              / (Shares_acq + Shares Issued to Target)

Accretive if Pro-Forma EPS > Standalone Acquirer EPS
```

---

## Appendix B — Representative AI Prompt Templates

### B.1 PDF Extraction System Prompt (sketch)

> You are a financial data extraction engine. Given the attached annual report PDF, extract the consolidated Income Statement, Balance Sheet, and Cash Flow Statement for the last 3 reported fiscal years. Return strict JSON matching the schema provided. For every line item, include `value`, `unit` (e.g., "INR Crore"), `fiscal_year`, and `source_page`. If a value is ambiguous, return `null` with a `note`. Do not invent numbers. Do not estimate.

### B.2 Q&A System Prompt (sketch)

> You are a senior equity analyst tutoring an MSc Finance student. The user's current model state is provided in `<model>` tags as JSON. Answer the user's question using only that data plus standard finance theory. Cite the specific cells or assumptions you reference (e.g., "Year-3 EBIT, line IS-23"). If the question requires data not in the model, say so explicitly. Explanations should be 3–5 sentences, intuition-first, formula-after.

### B.3 Memo Generation Prompt (sketch)

> Generate a one-page investment memo for the model state in `<model>`. Structure: (1) Company snapshot — 2 sentences. (2) Valuation summary — intrinsic value vs current price, methodology, key drivers. (3) Three key assumptions and rationale. (4) Top three risks, drawn from the filing's risk factors plus model sensitivities. (5) Bottom line: buy / hold / sell-style verdict, but framed as an analyst case, not a recommendation. Tone: McKinsey-meets-Damodaran. Length: 400–500 words. Markdown output.

---

## Appendix C — Reference Texts (for tutor-mode citations)

- Aswath Damodaran — *Investment Valuation* (3rd ed.)
- McKinsey & Co. — *Valuation: Measuring and Managing the Value of Companies* (7th ed.)
- Ross, Westerfield, Jaffe — *Corporate Finance*
- John C. Hull — *Options, Futures, and Other Derivatives* (for derivatives module, future)
- Indian GAAP/Ind-AS handbook (ICAI)
- IFRS Standards (IFRS Foundation)

---

## Document Status

- **Last updated:** May 2026
- **Owner:** Ira
- **Status:** Draft v1.0 — pending build-team review
- **Next milestone:** Lock answers to Section 15 → kick off Phase 1 engineering

---

*"The best financial model is the one a 23-year-old can build in 10 minutes, defend in a viva for 30 minutes, and improve every year of their career."*
