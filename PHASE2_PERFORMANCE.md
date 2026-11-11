# Phase 2 — Performance Optimization Report

**Date:** 12 November 2026
**Scope:** `G:\PSB\DS_Financial\DS_Financial`
**Goal:** Reduce blocking resources on first paint and verify the site performs correctly.

---

## 1. Measurement (before)

- **`dist/` total size:** 62.71 MB.
- Largest assets:
  - `vendor/ocr-lang/eng.traineddata.gz` — 10.42 MB
  - `vendor/ocr-core/tesseract-core-*.wasm.js` — ~4.5 MB × 6 variants
  - `vendor/ocr-core/tesseract-core-*.wasm` — ~3.3 MB × 6 variants
  - `vendor/qpdf.wasm` — 1.27 MB
  - `gst-black-mirror.html` — 1.51 MB (monolithic page)

## 2. Key Findings

| Finding | Impact |
|---------|--------|
| **Tesseract OCR (~50 MB)** is already **lazy-loaded on demand** (`js/statement-upload.js` line 22: `load('vendor/tesseract.min.js')` only when a user uploads a document). | ✅ Not a first-load cost. Leave as-is. |
| **Homepage `index.html`** loads **no external CDN scripts** (only Google Fonts + Font Awesome CSS + one inline script). | ✅ Already efficient. |
| **Tool pages** (`gst-tools`, `tax-portal`, `specialized-tools`, `resume-builder`) load **Chart.js + jsPDF + jsPDF-autotable synchronously in `<head>`**, blocking first paint. | ❌ **Fixed.** |
| `deploy/` is a stale full copy of the site; **not used by CI** (GitHub Pages deploys `dist`). | ⚠️ Left as-is (not deployed). |
| Third-party market widgets (SEBI/NSE iframes) inject external console noise. | ⚠️ External, not fixable in this repo. |

## 3. Changes Applied

Added `defer` to non-critical CDN scripts and app scripts on the three tool pages that load vendors synchronously:

| File | Change |
|------|--------|
| `gst-tools.html` | `defer` on Chart.js, jsPDF, jsPDF-autotable, `gst-tools.js` |
| `tax-portal.html` | `defer` on Chart.js, jsPDF, jsPDF-autotable, `tax-portal.js` |
| `specialized-tools.html` | `defer` on Chart.js, jsPDF, jsPDF-autotable, `specialized-tools.js` |

**Why `defer` is safe here:** the CDN vendors are only referenced inside event handlers/functions in the bottom-loaded app scripts (verified: no top-level `Chart`/`jsPDF` usage in the first 25 lines of each app script; the only inline matches in HTML were the `<script src>` tags themselves). `defer` scripts execute in document order after HTML parsing, preserving Chart.js → jsPDF → app-script dependency order.

## 4. Verification

- **Build:** `npm run build` → exit 0 (1.3s), changes present in `dist/`.
- **Browser render:** `file://.../dist/gst-tools.html` loads all 11 calculators + navigation + quick-reference table. Console errors are only from external SEBI/NSE iframe widgets — **no** `Chart is not defined` / `jsPDF is not defined`.
- **Functional test:** entered ₹1,000 @ 18% → **Total GST ₹180, CGST ₹90, SGST ₹90, Total ₹1,180**. Deferred script initialized and computes correctly.

## 5. Commit

- `0e537c9` — `perf: defer non-critical CDN scripts on tool pages` (3 files, 12 insertions/12 deletions).

## 6. Remaining / Recommended

1. **Split monolithic pages** — `gst-black-mirror.html` (1.51 MB) and `financial-modelling-advanced.html` (0.69 MB) are giant single HTML files. Extract shared logic into `js/` modules (already done for `financial-modelling.html`). This is a larger refactor.
2. **Trim duplicate OCR variants** — the build emits 6 `tesseract-core-*` variants (~50 MB total), but only one is used per browser. Consider emitting only the variants actually requested (verify via `tesseract.js` feature detection first).
3. **`defer` on remaining pages** — `resume-builder.html`, `pdf-ultra.html`, `investment-tools.html` also load heavy CDN scripts; apply the same pattern after verifying no parse-time vendor usage.
4. **Remove stale `deploy/` folder** if confirmed unused (GitHub Pages uses `dist`).

---

*End of Phase 2 report.*
