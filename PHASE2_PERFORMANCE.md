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
| `resume-builder.html` | `defer` on jsPDF, html2canvas, html2pdf, Sortable, Cropper, `ai-engine.js`, `resume-builder.js`, `global-features.js`, `enhanced-features.js` |
| `pdf-ultra.html` | `defer` on pdf-lib, jsPDF, pdf.js, mammoth, xlsx, Sortable, jszip, html2canvas, purify, `pdf-ultra.js` |

**Why `defer` is safe here:** the CDN vendors are only referenced inside event handlers/functions in the bottom-loaded app scripts (verified: no top-level `Chart`/`jsPDF` usage in the first 25 lines of each app script; the only inline matches in HTML were the `<script src>` tags themselves). `defer` scripts execute in document order after HTML parsing, preserving Chart.js → jsPDF → app-script dependency order.

> **`pdf-ultra.js` exception:** it references `pdfjsLib` at parse time, so `pdf-ultra.js` was also given `defer`. Because `defer` preserves document order, `pdf.js` still loads and runs before `pdf-ultra.js` executes — verified working.
>
> **`investment-tools.html` left unchanged:** it has 16 inline vendor usages in the body; deferring its Chart.js risks breaking those. Requires a deeper refactor.

## 4. Verification

- **Build:** `npm run build` → exit 0 (~1.0s), changes present in `dist/`.
- **Browser render (file://):** `gst-tools.html`, `pdf-ultra.html`, `resume-builder.html` all load fully.
- **Console:** errors are only from external SEBI/NSE iframe widgets — **no** `Chart is not defined`, `jsPDF is not defined`, or `pdfjsLib is not defined`.
- **Functional test (gst-tools):** entered ₹1,000 @ 18% → **Total GST ₹180, CGST ₹90, SGST ₹90, Total ₹1,180**. Deferred script computes correctly.
- **Resume Builder:** full editor (Content/Design/AI tabs, Personal Info, Experience, Education, Skills, live preview, Download PDF) renders.
- **PDF Tools:** full suite renders.

## 5. Commits

- `0e537c9` — `perf: defer non-critical CDN scripts on tool pages` (gst-tools, tax-portal, specialized-tools).
- `ca76c9a` — `perf: defer heavy CDN libs on resume-builder and pdf-ultra`.

## 6. Remaining / Recommended

1. **Split monolithic pages** — `gst-black-mirror.html` (1.51 MB) and `financial-modelling-advanced.html` (0.69 MB) are giant single HTML files. Extract shared logic into `js/` modules (already done for `financial-modelling.html`). This is a larger refactor.
2. **Trim duplicate OCR variants** — the build emits 6 `tesseract-core-*` variants (~50 MB total). **Risk:** `getCore.js` selects the variant at runtime by browser SIMD support (`relaxedsimd`, `simd`, or none), and each `.wasm.js` wrapper loads its matching `.wasm` from the same dir (verified: `wasmBinary` + `locateFile`, no inline embed). Trimming requires cross-browser runtime testing to confirm the selected variant is always present. **Leave as-is until verified.**
3. **`defer` on `investment-tools.html`** — requires refactoring its 16 inline vendor usages first.
4. **Remove stale `deploy/` folder** if confirmed unused (GitHub Pages uses `dist`).

---

*End of Phase 2 report.*
