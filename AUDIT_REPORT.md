# PSB SecureWealth / DS Financial – Codebase Audit Report

> Read-only audit of the active React frontend (`/tmp/psb-securewealth-frontend/client`) and the Node backend (`/e/DS_Financial/backend`).  
> No code was modified.  
> Last updated: 13 June 2026

---

## Executive Summary

| Area | Top Risk |
|------|----------|
| **Frontend** | Admin login bypass, fake MPIN acceptance, secrets/tokens/biometrics in `localStorage`, XSS sink, 277 lint errors, 1.14 MB main bundle. |
| **Backend** | Production auth bypass (`x-dev-user-email`), hardcoded admin credentials, weak JWT secret, path traversal, public seed/export/AI routes, leaked stack traces. |
| **Config/Deploy** | Frontend `.env` not in `.gitignore`; backend `.env` contains weak default secrets; `render.yaml` hardcodes admin password; CORS allows `*.surge.sh`. |

---

## Verified Metrics

```bash
# Frontend lint
/tmp/psb-securewealth-frontend/client $ npm run lint
✖ 277 problems (256 errors, 21 warnings)

# Backend audit
/e/DS_Financial/backend $ npm audit --audit-level=moderate
5 vulnerabilities (4 moderate, 1 high)
  - tmp   (GHSA-ph9p-34f9-6g65)  Path Traversal
  - qs    (GHSA-q8mj-m7cp-5q26)  DoS
  - uuid  (GHSA-w5hq-g745-h8pq)  Missing bounds check via exceljs

# Frontend build
/tmp/psb-securewealth-frontend/client $ npm run build
✓ built (warnings: large chunks, ineffective dynamic import for faceAuth.ts)
```

---

## Frontend Issues

### 🔴 Critical

| # | File | Line | Issue | Recommended Fix |
|---|------|------|-------|-----------------|
| 1 | `src/components/auth/LoginPage.tsx` | 559–569 | **Admin login bypass** – clicking “Admin Portal” dispatches `LOGIN` with `userId: 'admin'` without credentials. | Remove the bypass or require real backend admin auth. |
| 2 | `src/components/payments/UPIPaymentSimulator.tsx` | 125 | **Any 6-digit MPIN accepted** – `pin === '123456' \|\| pin.length === 6`. | Verify MPIN server-side or via secure enclave. |
| 3 | `src/components/auth/LoginPage.tsx` | 102–105 | **XSS via `innerHTML`** – injects `email` into toast HTML. | Use React JSX / DOMPurify for toasts. |
| 4 | `src/lib/backendApi.ts` | 12–19 | **Tokens read from `localStorage`** – vulnerable to XSS exfiltration. | Move session tokens to `httpOnly` secure cookies. |
| 5 | `src/components/admin/AdminDashboard.tsx` | 770, 871–872 | **Admin token stored in `localStorage`** (`sw-admin-token`). | Use `httpOnly` secure cookies + server-side validation. |
| 6 | `src/services/totpService.ts` | 6, 77–85 | **TOTP secret stored in `localStorage`** – attacker can generate valid codes. | Store secrets server-side; client only shows QR once. |
| 7 | `src/data/userProfiles.ts` | 21, 62, 100, 138, 176, 215 | **Demo passwords hardcoded in source** shipped to browser. | Remove plaintext passwords or seed backend-only. |
| 8 | `src/components/auth/BiometricAuth.tsx` | 133, 188, 205, 213, 231 | **Face descriptors & bypass flag in `localStorage`**; PIN hardcoded to `0000`. | Never store biometric templates client-side; remove bypass. |
| 9 | `src/components/auth/FaceLoginModal.tsx` | 119–225 | **Client-side face fallback** issues fake offline token when backend fails. | Fail closed; remove client-side face auth fallback. |
| 10 | `src/services/geminiService.ts` | 13–28, 58 | **API key persisted in `localStorage`** and sent in URL query string. | Proxy AI calls through backend; use `sessionStorage` at most. |

### 🟠 High

| # | File | Line | Issue | Recommended Fix |
|---|------|------|-------|-----------------|
| 11 | `src/hooks/useSupabaseSync.ts` | 31, 48 | Functions referenced inside `useEffect` before declaration → stale closures. | Declare helpers before effects or use `useCallback`. |
| 12 | `src/components/ai/WealthChat.tsx` | 1582, 1589 | `send(detail)` called before `send` is declared. | Move `send` above listener or use ref. |
| 13 | `src/components/admin/AdminDashboard.tsx` | 777–804 | Demo users merged with real users; stats double-count. | Separate demo mode or clearly label demo rows. |
| 14 | `src/components/admin/AdminDashboard.tsx` | 762–774 | Admin password sent plaintext; no MFA/rate-limit. | Use HTTPS-only cookies, rate-limit, MFA. |
| 15 | `src/components/admin/AdminDashboard.tsx` | 877–892 | PAN/Aadhaar search happens client-side → all PII in browser. | Server-side search returning minimal fields. |
| 16 | `vite.config.ts` | 44 | `sourcemap: false` in production. | Emit hidden source maps. |
| 17 | Build output | — | Main chunk 1.14 MB; vendor-ui 601 KB. | Route-based lazy loading; reduce icon deps. |
| 18 | `src/lib/faceAuth.ts` | 12–23 | Injects `face-api.js` from CDN without SRI/CSP. | Bundle via npm or add SRI + strict CSP. |
| 19 | `src/components/payments/UPIPaymentSimulator.tsx` | 139–149 | Transaction IDs from `Date.now()` are predictable/collidable. | Use `crypto.randomUUID()`. |

### 🟡 Medium / Low

- `client/.env` is **not in `.gitignore`** – high risk of accidental commit.
- `src/context/SecurityContext.tsx`: trust score computed from tamperable `localStorage` state.
- `src/components/ui/ErrorBoundary.tsx`: auto-clears security/lockdown state on crash.
- Many `localStorage`-based security features (duress mode, decoy accounts, skip-biometric flag) can be bypassed by editing storage.
- Accessibility: many icon-only buttons lack `aria-label`; missing `alt` text.
- 277 lint errors: mostly `no-explicit-any`, unused vars, hook dependency issues.
- `mlkem` build warning: `crypto` module externalized for browser compatibility – may fail in some browsers.

---

## Backend Issues

### 🔴 Critical

| # | File | Line | Issue | Recommended Fix |
|---|------|------|-------|-----------------|
| 1 | `middleware/auth.js` | 23–37 | **`x-dev-user-email` auth bypass enabled** – authenticates any request in production. | Remove entirely or gate behind `NODE_ENV !== 'production'` + second secret. |
| 2 | `routes/admin.js` | 12–13, 232 | **Hardcoded admin credentials** + password logged to console. | Read from env, strong unique password, rotate, remove log. |
| 3 | `backend/.env` | 10 | **Weak JWT secret** (`ds-financial-dev-secret-key-2024-secure`). | Generate ≥256-bit random secret; fail startup if default. |
| 4 | `server.js` | 138 | **Path traversal in `/tab_:name.js`** – `../../../etc/passwd` possible. | Whitelist names or verify resolved path stays in project root. |
| 5 | `server.js` | 184 | **Admin routes not guarded at router level** – one missing guard = full admin access. | Wrap admin router with `authMiddleware` + `requireRole('admin')`. |
| 6 | `routes/banking.js` | 829 | **`POST /api/v1/banking/seed` is public** – creates user and seeds data. | Remove or restrict to admin role. |
| 7 | `server.js` | 183 | **`/api/v1/export` is public** – expensive Excel generation open. | Require auth + body-size/timeout limits. |
| 8 | `server.js` | 180–181 | **`/api/v1/ai` and `/api/v1/extract` public** – quota/cost abuse + 50 MB uploads. | Require authentication. |

### 🟠 High

| # | File | Line | Issue | Recommended Fix |
|---|------|------|-------|-----------------|
| 9 | `middleware/auth.js` | 58 | JWT verify does not pin algorithm. | Pass `{ algorithms: ['HS256'] }`. |
| 10 | `services/websocket.js` | 37 | WebSocket JWT verify unpinned. | Pin algorithm. |
| 11 | Many routes | many | `err.message` leaked in 500 responses. | Return generic message; log details server-side. |
| 12 | Many files | many | Uncaught `JSON.parse` on untrusted/AI data. | Wrap in try/catch; return sanitized error. |
| 13 | `routes/auth.js` | 117–136, 205–224 | Refresh tokens not rotated; unlimited sessions. | Rotate on refresh; add logout/revoke; cap sessions. |
| 14 | `Dockerfile` | 12 | `.env` copied into Docker image. | Add `.env` to `.dockerignore`; inject at runtime. |
| 15 | `backend/.env` | 16 | Weak hardcoded `ENCRYPTION_KEY`. | Rotate/remove; load from vault. |
| 16 | `render.yaml` | 15–16 | Hardcoded `ADMIN_PASSWORD` in infra config. | Use `generateValue` or vault injection; rotate. |
| 17 | `services/database.js` | 470–475, 503–507 | SQL injection via dynamic column names. | Whitelist task names. |
| 18 | `routes/banking.js` | 106–107, 678 | `limit` query not capped. | Enforce max limit (e.g., 1000). |
| 19 | `routes/ai.js` | 389–469 | Streaming SSE branch skips quota increment. | Increment quotas for both streaming and non-streaming. |
| 20 | `routes/extract.js` | 93–176 | Temp PDFs not cleaned up on failure. | Delete in `finally` block. |
| 21 | `routes/kyc.js` | 32 | KYC marked verified without real verification. | Integrate eKYC or keep pending. |

### 🟡 Medium / Low

- CORS allows `*.surge.sh` subdomains (anyone can register one).
- CSP allows `'unsafe-inline'` scripts/styles.
- Razorpay webhook signature compared with `===` instead of `crypto.timingSafeEqual`.
- WebSocket errors send `error.message` to client.
- Face login is public and scans all users.
- `routes/admin.js` `/stats` queries non-existent `accounts` table (should be `bank_accounts`).
- CI workflow references `npm run lint` but backend `package.json` has no lint script.
- `docker-compose.yml` references MongoDB/Redis while app uses SQLite.

---

## Config / Deployment / Secrets

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Frontend `.env` not in `.gitignore` | `/tmp/psb-securewealth-frontend/client/.gitignore` | High | Add `.env`, `.env.*.local`, `*.local`. |
| Supabase placeholder in frontend `.env` | `/tmp/psb-securewealth-frontend/client/.env` | Medium | Replace with real Supabase URL + anon key when enabling auth. |
| Weak default JWT/encryption secrets | `/e/DS_Financial/backend/.env` | Critical | Generate strong random secrets; do not commit `.env`. |
| Hardcoded admin password in Render config | `/e/DS_Financial/backend/render.yaml` | Critical | Use generated/vault values; rotate. |
| CORS allows arbitrary surge subdomains | `/e/DS_Financial/backend/server.js:78–85` | Medium | List exact owned origins only. |
| Weak CSP | `/e/DS_Financial/backend/server.js:60–76` | Medium | Remove `'unsafe-inline'` for scripts; use nonces/hashes. |

---

## Recommended Priority Order

1. **Stop all auth bypasses** – remove `x-dev-user-email` bypass and the frontend admin bypass.
2. **Rotate secrets** – admin password, JWT secret, encryption key, Supabase keys if exposed.
3. **Remove/secure `localStorage` token/storage** – move to `httpOnly` cookies.
4. **Protect public backend routes** – seed, export, ai, extract.
5. **Fix path traversal** in `/tab_:name.js`.
6. **Fix fake MPIN** in UPI simulator.
7. **Fix XSS sink** in `LoginPage.tsx`.
8. **Add `.env` to frontend `.gitignore`** and remove `.env` from Docker images.
9. **Fix lint errors** and add `npm run lint` to CI gates.
10. **Run `npm audit fix`** on backend.

---

## How to Re-Run These Checks

```bash
# Frontend
cd /tmp/psb-securewealth-frontend/client
npm run lint
npm run build

# Backend
cd /e/DS_Financial/backend
npm audit --audit-level=moderate
npm test
```
