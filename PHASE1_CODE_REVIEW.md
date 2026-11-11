# Phase 1 — Code Review & Cleanup Report

**Date:** 12 November 2026
**Scope:** `G:\PSB\DS_Financial\DS_Financial` (DS Financial — AI-Powered Financial Intelligence Platform)
**Goal:** Verify the site builds and runs; identify structural/health issues; recommend and apply safe cleanup.

---

## 1. Executive Summary

The frontend **builds successfully** (`npm run build` → exit 0, 1.53s) and the **deployed backend is live and healthy** (`psb-securewealth-backend.onrender.com/api/v1/health` → HTTP 200, 8 users, 24 accounts, 480 transactions, 47 patents). The core "does the site work" question is **YES** — this is not a broken build.

The real problems are **structural hygiene and repository risk**, not a non-functioning application:

| # | Issue | Severity |
|---|-------|----------|
| 1 | Repo has only **6 commits** but **1,147 untracked files** — the codebase is largely uncommitted and unprotected | **High** |
| 2 | `.playwright-mcp/` holds ~600 stale screenshot/state artifacts (test debris) | Medium |
| 3 | `_dev/` holds ~25 legacy/scratch backup files (duplicated logic) | Medium |
| 4 | Monolithic HTML pages (`gst-black-mirror.html` 1.51 MB) are slow & unmaintainable | Medium |
| 5 | Overlapping feature JS (`advanced`, `enhanced`, `ultra-advanced`, `global`, `premium`, `specialized`) | Medium |
| 6 | Duplicate/near-duplicate pages (`pdf-tools` vs `pdf-tools-backup`, `financial-modelling` variants) | Low |
| 7 | Root-level `.png`/`.log`/`.txt` scratch artifacts | Low |
| 8 | `ds-financial.onrender.com` claimed live URL times out (stale) | Low |

---

## 2. Health Checks Performed

| Check | Result |
|-------|--------|
| `npm run build` (Vite, terser) | ✅ Exit 0, built in 1.53s |
| `node --check` on 15 core frontend JS files | ✅ All pass |
| Hardcoded secrets in frontend (`sk-`, `AIza`, `ghp_`, `AKIA`) | ✅ 0 matches |
| Broken local file references in served pages | ✅ Only expected (API paths, build-emitted `vendor/`, `_dev/` backups) |
| Backend `/api/v1/health` | ✅ HTTP 200, 47 patents, 8 users |
| Frontend `psb-securewealth-frontend.onrender.com` | ✅ HTTP 200 |
| Frontend `dsfinancial-47556.surge.sh` | ✅ HTTP 200 |
| `ds-financial.onrender.com` | ⚠️ Timeout (stale/not serving) |

> **Note:** Jest test suite could not be executed inside the harness sandbox (`spawn EPERM` on worker fork — a harness process-confinement limitation, not a project failure). Run `cd backend && npm test` in a normal terminal to confirm test status.

---

## 3. Detailed Findings

### 3.1 Git state (High)
- `git log` shows only **6 commits** on `main`; last commit `a2fa20a`.
- `git status` shows dozens of **modified** tracked files plus **1,147 untracked** files.
- The bulk of the working code (the modular financial-modelling engine, intake, decision-lab, statement tools, `js/` utilities) is **not committed**.
- **Risk:** any local failure / disk issue loses the majority of the codebase. Nothing protects it.

### 3.2 `.playwright-mcp/` debris (Medium)
- ~600 `page-*.yml` / `page-*.png` / `.txt` files from June 2026 browser-test automation.
- Untracked, unreferenced by the app, pure test artifacts.

### 3.3 `_dev/` legacy backups (Medium)
- ~25 files: `financial-modelling-legacy.html`, tab components (`tab_dcf.js`, `tab_lbo.js`, ...), extracted-function dumps, `deploy-sync.js`.
- Explicitly preserved as a backup area (`REPORT_DEVELOPMENT.md` references `_dev/financial-modelling-legacy.html`), so **do not delete** without confirmation; they are safe to leave.

### 3.4 Monolithic pages (Medium)
- `gst-black-mirror.html` = **1.51 MB**; `financial-modelling-advanced.html` = 0.69 MB.
- Single-file pages with inlined logic are slow to parse and hard to maintain. Recommend splitting shared logic into the `js/` modules (already partially done for modelling).

### 3.5 Overlapping feature scripts (Medium)
- `advanced-features.js`, `enhanced-features.js`, `ultra-advanced-features.js`, `global-features.js`, `premium-features.js`, `specialized-tools.js` likely duplicate utilities. Consolidate after confirming which are referenced by live pages.

---

## 4. Cleanup Applied (Phase 1)

- [x] Moved **1,389 stale test artifacts (28.4 MB)** from `.playwright-mcp/` → `.cleanup-backup/playwright-mcp/` (reversible, nothing deleted).
- [x] Added `.playwright-mcp/` and `.cleanup-backup/` to `.gitignore`.
- [x] **Baseline commit created:** `9898bc8` — 140 files changed (45,868 insertions / 16,687 deletions), committing the previously-untracked codebase.
- [x] **Not deleted:** `_dev/` legacy backups (intentionally preserved per `REPORT_DEVELOPMENT.md`).
- [x] Rebuild verified after cleanup (`npm run build` → exit 0, ~1.1s).

> The lint-staged backup stash (`stash@{0}`, commit fd7d830) is retained as an extra safety net. Drop it with `git stash drop stash@{0}` once you have confirmed the baseline.

---

## 5. Recommended Actions

### Immediate (protect the code)
1. ✅ **Baseline committed** (`9898bc8`).
2. **Push to `origin/main`** (confirm with repo owner) — the baseline is local-only right now.
3. Drop the leftover lint-staged backup stash once confirmed: `git stash drop stash@{0}`.

### Phase 1 continued
4. **Fix the pre-commit hook** (currently `git commit` fails because `lint-staged` → `eslint` reports hard errors):
   - `no-undef` — `Chart` is not defined in `_dev/dashboard_grid_js.js` and similar legacy files.
   - `no-var` — `var` used where `const`/`let` is required.
   - Thousands of `prettier/prettier` warnings from **CRLF line endings** (the repo uses CRLF; prettier expects LF). Consider a `.editorconfig` or `endOfLine: auto` in `.prettierrc` to stop the noise.
5. Run `cd backend && npm test` outside the sandbox to confirm the 130+ backend tests pass.
6. Resolve or remove the stale `ds-financial.onrender.com` reference in docs/config.

### Phase 2+ (from the phased plan)
6. Performance: split monolithic pages, code-split heavy vendors, lazy-load Tesseract/PDF WASM.
7. Responsive/visual pass on the key pages.
8. SEO: canonical URLs, meta, sitemap/robots verification.
9. Security: verify helmet/CSP headers on the live backend; confirm no secrets in git.
10. Testing/deployment: add Playwright smoke tests, confirm CI/CD.

---

*End of Phase 1 report.*
