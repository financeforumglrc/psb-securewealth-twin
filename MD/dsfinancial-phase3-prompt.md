# dsFinancial — Phase 3 Upgrade Prompt
## Audit, Harden, Then Extend

**Paste this entire document into Claude Code / Cursor / your AI coding tool as the system + task brief.**

---

## 0. Context for the AI Assistant Reading This

You are continuing work on **dsFinancial**, a portfolio-grade AI-powered financial modeling tool. Phase 1 and Phase 2 v2 have been built across the previous sessions. The current claimed state is:

- Express + SQLite backend with AI provider layer (Gemini default + BYOK adapters for Anthropic/OpenAI).
- Routes: `/api/v1/extract/pdf`, `/api/v1/ai/chat`, `/api/v1/ai/explain-cell`, `/api/v1/ai/test-key`, `/api/v1/gallery`, `/api/v1/gallery/:slug`.
- Database tables: `ai_runs`, `server_quota`, `extractions`, `device_ids`, `financial_models`.
- Frontend: gallery page, PDF drop zone, AI chat panel, BYOK settings modal, contextual tutor mode.
- Seed models for Reliance Industries, TCS, Infosys.

**Critical caveat:** the previous deployment report claimed "✅ Deployed Successfully" but listed unfinished steps (Railway deploy pending, Gemini key not added, demo not run). **Do not assume any Phase 2 v2 feature is working end-to-end until you verify it in Phase 3 Module 0 below.**

Your job is to do two things, **in this order**:

1. **Audit Phase 2 v2** — verify every feature actually works against a deployed backend with a real Gemini key. Fix anything broken. Do not start new modules until the recruiter demo script (8 steps) passes end-to-end on a real device.
2. **Extend** — once audit is green, add Phase 3 features that complete the portfolio-grade product.

---

## 1. Phase 3 Goals

After this phase, the product must:

1. **Pass the 8-step recruiter demo on first try, on mobile data, with no broken features.**
2. **Export any model to Excel (.xlsx) with live formulas** — open in Excel, change a cell, watch dependent cells recalculate. This is table stakes for a finance portfolio.
3. **Generate a 1-page investment memo as a PDF** — AI-written, polished, recruiter-shareable.
4. **Surface anomalies automatically** — if the balance sheet doesn't balance, if WACC < terminal growth, if a forecast margin drifts wildly from history — flag visibly with one-click AI explanations.
5. **Apply AI to LBO and M&A modules** (currently AI-less per the v2 scope).
6. **Be properly observable** — a `/admin/status` page (password-gated) showing live AI quota, error rates, recent extractions, popular models.
7. **Have a real published case study and demo video** — these are deliverables, not afterthoughts.

---

## 2. Architecture — No Major Changes

Stay on the existing stack:
- Express + SQLite backend on Railway (or wherever Phase 2 deployed to).
- Static HTML/CSS/JS frontend on Surge / Netlify.
- Gemini free tier + BYOK.
- New dependencies allowed: `exceljs` (Excel export), `pdf-lib` or `puppeteer` (memo PDF generation), `node-cron` (anomaly daily sweep — optional).

**Do not migrate to Next.js. Do not introduce Supabase. Do not refactor things that aren't broken.**

---

## 3. Module 0 — Phase 2 Audit (BLOCKING)

You cannot start any other module in Phase 3 until this passes. Read it carefully.

### 3.1 Run the deployment audit script

Create `scripts/audit-phase2.js` that hits the deployed backend and verifies every endpoint:

```js
// scripts/audit-phase2.js
// Run with: API_BASE=https://your-railway-url.app/api/v1 node scripts/audit-phase2.js

const checks = [
  { name: "Health endpoint", method: "GET", path: "/health", expect: r => r.status === "ok" },
  { name: "Gallery list", method: "GET", path: "/gallery", expect: r => Array.isArray(r) && r.length >= 3 },
  { name: "Reliance model loads", method: "GET", path: "/gallery/reliance-industries", expect: r => r.company?.name },
  { name: "TCS model loads", method: "GET", path: "/gallery/tcs", expect: r => r.company?.name },
  { name: "Infosys model loads", method: "GET", path: "/gallery/infosys", expect: r => r.company?.name },
  { name: "AI test endpoint (Gemini)", method: "POST", path: "/ai/test", body: { task: "chat", message: "Reply with the single word: OK" }, expect: r => r.text?.includes("OK") },
  { name: "AI explain-cell", method: "POST", path: "/ai/explain-cell", body: { cell: { label: "FCFF Year 3", value: 12500, formula: "EBIT*(1-t)+DA-CapEx-dWC" }, context: { currency: "INR" } }, expect: r => r.what_it_is && r.how_it_was_calculated },
  { name: "Server quota check", method: "GET", path: "/admin/quota", expect: r => typeof r.remaining === "number" },
];

(async () => {
  let pass = 0, fail = 0;
  for (const c of checks) {
    try {
      const res = await fetch(`${process.env.API_BASE}${c.path}`, {
        method: c.method,
        headers: { "Content-Type": "application/json" },
        body: c.body ? JSON.stringify(c.body) : undefined,
      });
      const data = await res.json();
      if (c.expect(data)) { console.log(`✅ ${c.name}`); pass++; }
      else { console.log(`❌ ${c.name}`, data); fail++; }
    } catch (e) {
      console.log(`💥 ${c.name}: ${e.message}`); fail++;
    }
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
```

**Run this against the actual deployed backend.** Report results to the user before doing anything else.

### 3.2 Verify seed model integrity (CRITICAL)

There is a real risk that the gallery seed models contain fabricated financial values. Open `seeds/gallery-models.js` (or wherever they live). For each of Reliance, TCS, Infosys, verify these numbers against the companies' FY24 (or latest reported) annual reports:

- Total Revenue
- EBITDA
- Net Income / PAT
- Total Assets
- Total Equity
- Shares Outstanding
- Reported "current market cap" if hardcoded

**Recommended sources (verify, do not trust without checking):**
- Reliance Industries: `https://www.ril.com/InvestorRelations`
- TCS: `https://www.tcs.com/investor-relations`
- Infosys: `https://www.infosys.com/investors.html`

If any value is more than 5% off the reported figure, **fix the seed data**. A recruiter who actually knows Indian capital markets (i.e., the exact recruiter you want to impress) will spot fabricated numbers in 30 seconds.

For the "intrinsic value" output: this should be a *computed* DCF output from the model, not a hardcoded number. If it's hardcoded, refactor so the model actually runs DCF math against the inputs and produces the intrinsic value at runtime.

Report to the user: "Seed audit — Reliance: X cells matched source / Y cells off by >5% / Z cells fabricated. Same for TCS, Infosys."

### 3.3 Run the recruiter demo

Manually execute the 8-step demo from Phase 2 v2 Section 7. For each step, record: ✅ works / ⚠️ works with issues / ❌ broken.

If anything fails, fix it before moving on. **Do not start Module 1 of Phase 3 until all 8 steps pass.**

---

## 4. Module 1 — Excel Export with Live Formulas

This is the highest-leverage Phase 3 feature. A finance recruiter who downloads your Excel and sees live formulas (not pasted values) will take you seriously.

### 4.1 Endpoint

`POST /api/v1/models/:id/export/xlsx`

Request body: `{ model_snapshot: FinancialModel }`

Response: `.xlsx` file as binary download.

### 4.2 Implementation

Use **ExcelJS** (`npm i exceljs`). It supports formulas, formatting, merged cells, and named ranges — everything you need to look professional.

**Required worksheets:**

1. **Cover** — company name, ticker, model date, "Built with dsFinancial — [URL]" footer with hyperlink.
2. **Assumptions** — every editable input on its own row, with cell color (blue = hardcoded input, black = formula, green = check). Named ranges for `WACC`, `g_terminal`, `tax_rate`, etc.
3. **Income Statement** — historicals as values, forecasts as formulas referencing Assumptions sheet.
4. **Balance Sheet** — same.
5. **Cash Flow** — derived via formulas from IS + ΔBS (not hardcoded).
6. **DCF** — FCFF roll-forward, terminal value (Gordon Growth formula in-cell), discount factors, sum, EV → equity bridge, per-share value. **Every output must be a formula, not a value.** Change WACC on Assumptions sheet → DCF recalculates.
7. **Sensitivity** — 2-way data table: WACC × g → per-share value, computed by `=` formulas referencing Assumptions named ranges.
8. **Checks** — balance sheet balance, sources/uses tie, etc. — green ✓ / red ✗ via conditional formatting.

### 4.3 Formula authoring rules

- Use **named ranges** for assumption cells (`=WACC` not `=Assumptions!$B$4`). Cleaner for the user.
- Use Excel-native functions only: `SUM`, `NPV`, `IRR`, `IF`, `INDEX/MATCH`, `XLOOKUP`. Avoid array formulas unless necessary.
- Format numbers properly: `#,##0.00 "Cr"` for INR Crore, `0.0%` for percentages, dates as `dd-mmm-yyyy`.
- Lock all formula cells, leave assumption cells unlocked (sheet protection optional but professional).

### 4.4 Frontend wiring

Add an **Export Excel** button in the top-right action bar of `financial-modelling.html`. On click: POST current model state to the endpoint, receive binary, trigger browser download with filename `{Company}_DCF_{YYYY-MM-DD}.xlsx`.

### 4.5 Acceptance

- Open exported file in Microsoft Excel (or LibreOffice / Google Sheets).
- Change WACC from 11% to 13% on the Assumptions sheet.
- DCF intrinsic value cell recalculates immediately (no `#REF!`, no `#VALUE!`).
- All 8 worksheets present, formatted, no broken formulas.
- Sensitivity table populated and editable.
- Checks sheet shows all green ✓.

---

## 5. Module 2 — Investment Memo Generator (PDF)

A 1-page memo that recruiters can read in 60 seconds and forward to their PM. This is the single artifact most likely to land you an interview.

### 5.1 Endpoint

`POST /api/v1/ai/memo`

Request: `{ model_snapshot: FinancialModel }`

Response (JSON): `{ memo_id, sections: { snapshot, valuation_summary, key_assumptions, risks, bottom_line }, generated_at }`

### 5.2 Generation flow

1. Pass the model JSON + a focused system prompt (Appendix A) to Gemini 2.5 Flash.
2. Force structured JSON output with the 5 sections.
3. Save to a `memos` table for re-download.
4. Render to PDF using **Puppeteer** (most flexible) or **pdf-lib** (lighter). Recommended: Puppeteer renders a clean HTML template to PDF — easiest path to a polished look.

### 5.3 PDF template (Puppeteer + HTML)

One page, A4. Header with company name + dsFinancial logo. 5 sections in fixed positions. Footer: *"Generated by dsFinancial AI. Not investment advice. {date}."*

Typography: a serif body font (Source Serif, Lora) for the memo voice. Sans-serif headers. Hardcoded INR / ₹ formatting.

### 5.4 Frontend wiring

Button: **Generate Memo (PDF)** next to Export Excel. On click: spinner ("Generating memo... ~15s"), then download.

Also add a **Memo preview modal** showing the HTML version inline before download — recruiter-friendly preview, lets the user catch errors before sharing.

### 5.5 Acceptance

- Load Reliance gallery model → click Generate Memo → within 20s, a polished one-page PDF downloads.
- The memo numerics match the model (no hallucinated values; spot-check intrinsic value, WACC, terminal growth).
- Risks section references real risk factors a finance person would recognize (regulatory, commodity, capital allocation, etc.).
- "Bottom line" frames an analyst case, not a buy/sell recommendation. (Compliance.)

### 5.6 Token cost guardrail

This call hits Gemini Flash, which has a 250 RPD free tier limit. Cache aggressively: hash `(model_id, model_version)` → memo response in DB for 24h. Re-generating with no model changes returns cached PDF instantly.

---

## 6. Module 3 — Anomaly Detection Layer

A passive system that watches the model and flags issues. Most of it is deterministic (no AI needed); AI only kicks in for the *explanation*.

### 6.1 Deterministic checks (run on every model mutation)

Implement as `services/anomaly-detector.js` returning an array of flags:

```js
function detectAnomalies(model) {
  const flags = [];
  // Each check returns { severity, code, message, cell_ids[] }

  // Balance sheet balance check
  for (const year of model.statements.balance_sheet.years) {
    const assets = sum(year.assets);
    const liabilitiesEquity = sum(year.liabilities) + sum(year.equity);
    if (Math.abs(assets - liabilitiesEquity) > 0.01 * assets) {
      flags.push({ severity: "error", code: "BS_UNBALANCED", year, ... });
    }
  }

  // WACC vs terminal growth
  if (model.dcf && model.dcf.wacc.value <= model.dcf.terminal_growth.value) {
    flags.push({ severity: "error", code: "WACC_LE_G", ... });
  }

  // Negative FCFF in terminal year
  // Margin drift > 500 bps from historical avg without note
  // NCI > equity
  // Goodwill > 50% of total assets
  // Effective tax rate < 0 or > 60%
  // Revenue growth > 100% or < -50% YoY without note
  // Cash flow doesn't tie to BS cash movement
  // ... etc.
}
```

Run on every model save. Store flags in `model_flags` table.

### 6.2 UI surface

- **Top banner** when any error-severity flag is active: 🔴 "Balance sheet doesn't balance in FY24. Difference: ₹240 Cr. [Show me] [Explain]"
- **Side panel** with all flags grouped by severity. Each flag has: cells highlighted in the model, "Explain with AI" button.
- **Explain with AI** → POST `/api/v1/ai/explain-anomaly` with the flag + relevant model context → Gemini returns a 3-sentence explanation: what's wrong, what could cause it, how to fix.

### 6.3 Acceptance

- Load Reliance gallery model. Manually corrupt the balance sheet (subtract 100 from total assets). Save.
- Within 1 second: red banner appears citing the imbalance with exact ₹ figure and affected year.
- Click "Explain": AI explanation appears within 3s.
- Fix the value: banner disappears.

---

## 7. Module 4 — AI on LBO & M&A Modules

The LBO and M&A modules currently have manual entry and computed outputs but no AI surface. Phase 3 closes the gap.

### 7.1 LBO

- **AI Suggest** button on key assumption cells: entry multiple, exit multiple, debt/equity ratio, hold period.
  - Click → Gemini suggests value + 2-sentence rationale based on industry norms and the target's profile.
- **"Explain returns" button** at the bottom of the LBO output panel: AI generates a 3-paragraph commentary on the IRR/MoM, attributing returns to (a) EBITDA growth, (b) multiple expansion, (c) deleveraging. The classic LBO value-creation bridge.

### 7.2 M&A

- **"Is this deal accretive?" headline** with AI-written explanation of why/why not (~3 sentences citing the pro-forma EPS math).
- **Synergy stress test:** AI suggests low/base/high synergy values based on industry benchmarks for similar deals.
- **Goodwill commentary:** if goodwill > 30% of deal value, AI flags it and explains the impairment risk.

### 7.3 Acceptance

- LBO module: enter target = a sample mid-cap Indian company, run AI Suggest on each assumption → all 4 suggestions populated with rationale within 10s.
- M&A module: build a hypothetical deal where acquirer EPS is ₹50 and the deal is dilutive → AI headline reads "Dilutive: pro-forma EPS of ₹47 vs standalone ₹50, primarily due to..."

---

## 8. Module 5 — Admin Status Page (Observability)

You can't run a portfolio project you can't see. A simple `/admin/status` page (HTTP basic auth, password in env var) shows:

- Server quota: X / 250 Flash requests used today, Y / 1000 Flash-Lite, Z / 100 Pro.
- Last 50 extractions: timestamp, company name, success/fail, latency, confidence.
- Top 10 most-viewed gallery models this week.
- Active device IDs (last 24h): count.
- Recent errors from `ai_runs` where `success = false`.
- Disk usage on `/uploads` folder.
- **Auto-refresh every 30s.**

This is also a great screenshot for the case study: *"Real-time observability dashboard."*

### Acceptance

`GET /admin/status` with basic auth header returns an HTML page rendering all 6 widgets. Numbers update on refresh.

---

## 9. Portfolio Deliverables — Phase 3 Finalization

These were started in Phase 2 v2 (§4) but likely not finished. Phase 3 closes them out.

### 9.1 Case study writeup

Open the Notion / Medium draft from Phase 2. Update with Phase 3 features. Add screenshots of:
- The gallery page.
- A populated DCF with Tutor Mode tooltip.
- The chat panel mid-conversation.
- The exported Excel open in Microsoft Excel with formulas visible.
- The generated PDF memo.
- The admin status page.

**Publish it.** Get a public URL. Link from the README.

### 9.2 Demo video

Record the 2-minute video from Phase 2 v2 §4.3. Include the new Excel export and memo generation in the script. **Upload to Loom or YouTube.** Get a public URL. Link from README + case study + LinkedIn.

### 9.3 LinkedIn post

Draft and schedule. Image: a 4-panel collage (gallery / DCF / memo PDF / Excel screenshot). Caption: 3 paragraphs (problem → build → invite). Tag your university, finance professors if appropriate, and 2-3 relevant fintech / VC communities in India.

### 9.4 Resume bullet

Add to your CV under projects:

> **dsFinancial** — AI-powered financial modeling platform (live demo · GitHub · case study)
> Built an end-to-end DCF / Comps / LBO / M&A modeling tool with AI-assisted PDF extraction (Gemini API), contextual tutor mode, and one-click Excel export. Stack: Express, SQLite, vanilla JS, Gemini AI. Real models for Reliance, TCS, Infosys in the public gallery. [Live: dsfinancial.in]

---

## 10. Acceptance Criteria for Phase 3 (Full Demo Script)

Phase 3 is done when a recruiter, on mobile, in <10 minutes, can:

1. Visit the live URL.
2. Tap a gallery company → see populated dashboard.
3. Hover a cell with Tutor Mode → see AI explanation.
4. Open AI Chat → ask a question → get a streamed answer.
5. Click **Export Excel** → open the file → change WACC → see DCF recalculate live.
6. Click **Generate Memo** → see a polished 1-page PDF.
7. (Owner only) View `/admin/status` → see real usage metrics.
8. Notice an intentional anomaly (test the imbalanced BS scenario) → see the banner and AI explanation.
9. Run the LBO model with AI suggestions → see the value-creation bridge commentary.
10. Click through to the published case study, GitHub repo, demo video, and LinkedIn post.

10 of 10 must work.

---

## 11. Out of Scope for Phase 3

Do not work on:

- User authentication (still device_id only).
- Billing / paywall / Pro tier.
- Real-time collaboration / multi-user.
- Mobile app.
- Monte Carlo (still deferred — too costly on free Gemini tier).
- Migration to Next.js / Vercel.
- Internationalization.

---

## 12. Implementation Order

| Week | Deliverable |
|---|---|
| **Week 1** | **Module 0 (Audit)** — fix everything Phase 2 left broken. Verify seed data integrity. Run recruiter demo. |
| **Week 2** | Module 1 (Excel export) — the #1 finance recruiter signal. |
| **Week 3** | Module 2 (Memo PDF) + Module 3 (Anomaly detection). |
| **Week 4** | Module 4 (AI on LBO/M&A) + Module 5 (Admin page) + Portfolio finalization (§9). |

**Hard rule:** Do not start Week 2 until Module 0's audit script returns 0 failures and the 8-step recruiter demo from Phase 2 v2 passes. If audit reveals broken Phase 2 features, **fix them in Week 1**. Do not paper over with new features.

---

# Appendix A — Memo Generation System Prompt

```
You are a senior equity research analyst writing a one-page investment memo for a finance student's portfolio project. The model is provided as JSON inside <model> tags.

Generate a memo with exactly five sections, returned as strict JSON (no preamble):

{
  "snapshot": "2-sentence company description: sector, geography, scale.",
  "valuation_summary": "3-4 sentences: intrinsic value per share vs current market price (cite both with ₹), methodology used (DCF / Comps), and the key driver of the result.",
  "key_assumptions": "3 bullets of the most important assumptions and their rationale. Format as a single string with '• ' separators.",
  "risks": "3 bullets covering the top risks. Pull from the company's risk profile (regulatory, sector cyclicality, capital allocation, FX, etc.). Format as a single string with '• ' separators.",
  "bottom_line": "2-3 sentences framing the analyst case. Position as 'the bull case rests on X; the bear case on Y.' DO NOT recommend buy or sell."
}

RULES:
- All numbers must come from the model JSON. Do not invent figures.
- Use ₹ Crore notation for INR.
- Tone: McKinsey-meets-Damodaran. Professional, dense, no fluff.
- Total length across all sections: 350-450 words.
- Cite specific cells using [cell:line_item_id] format where helpful.

<model>
{INSERT_MODEL_JSON}
</model>
```

---

# Appendix B — Anomaly Explanation System Prompt

```
You are a finance tutor. The user's model has triggered an automated anomaly check. Explain it concisely.

Input:
{
  "flag": { "code": "BS_UNBALANCED", "message": "...", "year": "FY24", "diff_amount": 240 },
  "model_context": { /* relevant subset */ }
}

Output (strict JSON):
{
  "what_happened": "1 sentence in plain English.",
  "likely_causes": "2-3 most common causes, formatted as '• ' separators.",
  "how_to_investigate": "1-2 sentences pointing to specific cells or schedules to check."
}

Max 100 words total. Be specific to the year and amounts cited.
```

---

# Appendix C — Excel Export — Worksheet Spec Summary

| Sheet | Purpose | Key Cells |
|---|---|---|
| Cover | Title, branding, links | A1:H10, hyperlink to dsfinancial.in |
| Assumptions | All editable inputs | Named ranges: WACC, g_terminal, tax_rate, horizon, ERP, Rf, beta |
| Income Statement | 3 historical + 5 forecast years | Forecast columns = formulas |
| Balance Sheet | Same structure | Working capital schedule embedded |
| Cash Flow | Derived | All cells = formulas; never hardcoded |
| DCF | FCFF roll-forward → TV → EV → Equity → /share | All = formulas referencing other sheets |
| Sensitivity | 2-way data table | =P_per_share with WACC and g as table axes |
| Checks | BS balance, CF tie | Conditional format: green ✓ / red ✗ |

---

## End of Prompt

When you start, your first message should:

1. Confirm you've read Module 0 and understand it is blocking.
2. Run the audit script (or write it first if it doesn't exist) and **paste the actual output** before doing anything else.
3. Report seed data audit findings against real company reports.
4. Report the 8-step recruiter demo results.

**Only after the audit comes back clean** should you propose Module 1 (Excel export) as the first PR. If audit reveals breakage, fix that in PR 1 and re-audit before moving on.

Do not write speculative code for Modules 1-5 before Module 0 passes. The user has been burned by "✅ Deployed Successfully" reports that weren't actually deployed. Earn trust by verifying before extending.
