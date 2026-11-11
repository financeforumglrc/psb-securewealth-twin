# Phase 4 — Link Management Report

**Date:** 12 November 2026
**Scope:** `G:\PSB\DS_Financial\DS_Financial`
**Goal:** Find and fix broken/dead links across the site.

---

## 1. Audit Method

A custom Node script (`link-audit.cjs`) scanned all 26 entry HTML files, resolving every `href`:
- **Internal page links** → verified target file exists.
- **Anchor links** (`page.html#id`) → verified the `id` exists in the target file.
- **External links** → collected (not checked online; 21 unique external URLs).

**Initial result:** 180 internal links OK, **196 broken links** (69 "missing page" were false positives from CSS `<link rel=stylesheet>`; the rest were missing anchors).

## 2. Root Cause

The tool pages (`tax-portal.html`, `gst-tools.html`, `specialized-tools.html`) use a **tabbed panel architecture**:
- Sidebar nav uses `data-tool="hra"` → JS shows `<div id="panel-hra">`.
- But external deep-links used bare `#hra` — which **doesn't exist** (the real ID is `#panel-hra`).

So links like `tax-portal.html#hra` silently failed (loaded the page but didn't open the HRA tab).

## 3. Fixes Applied

### a) Rewrote 40 broken deep-links to correct `#panel-<id>` anchors
Exact-match mapping only (no guessing). Files: `index.html` (11), `index-new.html` (20), `blog.html` (1), `pdf-tools-backup.html` (8).

### b) Added hash-based panel navigation (deep-linking)
Added to `tax-portal.js` and `specialized-tools.js` — on page load, if `location.hash` is `#panel-<toolId>` (or a valid `data-tool`), it opens that panel. `gst-tools.js` already had this.

### c) Verified the live homepage is clean
After fixes, **`index.html` (live homepage) has zero broken links.**

## 4. Verification

- **Build:** `npm run build` → exit 0.
- **Internal OK links:** 180 → **230**.
- **Browser test:** navigated to `tax-portal.html#panel-hra` → HRA panel opens correctly (was the default regime panel before).
- **Live-page clean check:** excluding legacy/backup files, the **only** remaining broken anchors are in `index-new.html` (an orphaned alternate homepage with 0 inbound links — not part of live navigation).

## 5. Commits

- `67460ee` — `fix(links): repair broken deep-links and add hash navigation` (6 files, 68 insertions / 50 deletions).

## 6. Remaining / Notes

- **`pdf-tools-backup.html`** — legacy backup file (not deployed; `pdf-tools.html` is a redirect to `pdf-ultra.html`). Its ~30 stale anchors (e.g. `resume-builder.html#templates`, `index.html#services`) point to content that no longer exists. **Low priority** — not part of the live nav. Recommend archiving/deleting the backup.
- **`index-new.html`** — orphaned alternate homepage (0 inbound links). Recommend archiving.
- **Investment-calculator anchors on `tax-portal.html`** (e.g. `#cagr-calc`, `#home-loan`, `#dcf-calc`) — these calculators actually live on `investment-tools.html`, not `tax-portal.html`. These links point to the wrong page entirely and need a product decision (either move those calculators or fix the links).
- The 21 external links were not live-checked; verify they resolve.

---

*End of Phase 4 report.*
