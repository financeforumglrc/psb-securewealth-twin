# Phase 7 — Security Measures Report

**Date:** 12 November 2026
**Scope:** `G:\PSB\DS_Financial\DS_Financial` + `backend/`
**Goal:** Verify the site's security posture; find and fix any real exposure.

---

## 1. Audit Findings

### a) Live backend security headers (via `https://psb-securewealth-backend.onrender.com/api/v1/health`)
| Header | Value | Verdict |
|--------|-------|---------|
| `Content-Security-Policy` | Comprehensive (`default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `frame-ancestors 'self'`; `object-src 'none'`; `upgrade-insecure-requests`) | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | ✅ |
| `Referrer-Policy` | `no-referrer` | ✅ |

### b) Source helmet config (`backend/server.js`)
Full allowlist incl. **CDNs the frontend needs** (`cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `unpkg.com`) + **`'wasm-unsafe-eval'`** (required by Tesseract WASM OCR) + Razorpay frame/script. ✅

### c) ⚠️ Deployment drift (the one finding)
The **live backend returns a stricter CSP** than the committed source:
- Live: `script-src 'self' 'unsafe-inline'` — **no CDN allowlist, no `wasm-unsafe-eval`**.
- Source: `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://checkout.razorpay.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com`.

**Conclusion:** the live deployment runs an **older version** than the committed source. The source is correct; the live app needs a **redeploy**. Not a code bug.

### d) Secrets exposure
- **No secrets/keys** in any git-tracked source file (scanned `sk-`, `AIza`, `ghp_`, `AKIA`, `xox`, `rzp_`, private keys). ✅
- **`.env` is gitignored** in BOTH the root repo and the `backend` repo (`backend/.env` confirmed ignored via `git check-ignore`). ✅
- **`.env.example`** contains placeholders only. ✅

### e) Authentication & rate limiting
- `bcryptjs` password hashing, JWT auth. ✅
- Password min 8 chars + complexity check. ✅
- Global rate limiter: 100 req / 15 min. ✅
- Stricter AI limiter: 10 req / min. ✅
- Body limit: 10 MB. ✅
- `dotfiles: deny` on static serving. ✅

## 2. Changes Applied

**None required.** The security posture is strong in source. The only finding (live CSP older than source) is a **deployment** issue, not a code issue — redeploy the backend from current `main`.

## 3. Recommendations

1. **Redeploy the backend** from the committed source to pick up the correct CSP (CDN allowlist + `wasm-unsafe-eval`).
2. **Add `Permissions-Policy`** (currently absent) — e.g. `camera=(), microphone=(), geolocation=()`.
3. **Rotate the local `backend/.env` key** as a precaution if that file was ever shared.
4. **Add a GitHub secret-scanning / `gitleaks` pre-commit hook** to prevent future secret commits.

---

*End of Phase 7 report.*
