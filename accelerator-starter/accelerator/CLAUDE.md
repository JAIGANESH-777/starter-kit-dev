# Project Instructions

Read `SPEC.md`, `ACCELERATOR_SPEC.md`, and `shared_tokens.md` completely before making any changes.

## Rules

- Scaffold the project **exactly** as described in `SPEC.md`.
- Follow the **Section 8 directory structure** in `SPEC.md` precisely — do not invent or rename directories.
- Follow the **Section 9 scaffold pipeline** in order — do not skip or reorder steps.
- Use assets from `./assets/`.
- Apply all design tokens from `shared_tokens.md` natively across all visual themes.
- Create `frontend/` and `backend/` as specified in `SPEC.md`. Never merge them.
- **Do NOT rewrite or modify** the root `docker-compose.yml` — copy and use the dynamically generated configuration from Section 6 of the SPEC.
- Keep all secrets in `.env.example` — never hardcode credentials.
- Never use `localhost` as a hostname inside Docker containers — use service names (`db`, `backend`).
- If `Multi-Tenant: Yes` in SPEC Section 5 — register global tenant scoping at app bootstrap. NestJS: `{ provide: APP_INTERCEPTOR, useClass: TenantInterceptor }` in `app.module.ts` providers. Express/Fastify/Hono: `app.use(tenantMiddleware)` before all route handlers and apply `@CurrentTenant()`. FastAPI: use a `get_tenant_id` dependency to extract `tenant_id` from headers/claims and scope database sessions. Django: add `TenantMiddleware` with thread-local storage/context vars, and use a custom Model Manager to auto-filter queries by `tenant_id`. Every DB query touching tenant data MUST be scoped to the active tenant ID.
- Implement **every auth method** listed in SPEC Section 5 with its own distinct UI — do not default to email/password for all methods. Magic Link → email input + "Send Magic Link" button only; OTP/SMS → phone input → 6-digit code two-step form; OAuth → branded provider button.

## L-2 Verification Step

Implement `GET /api/health` → `{ status: "ok" }` in the backend.
**Verify it returns HTTP 200 before writing a single frontend component.**

## Design Tokens

- Use `--color-*` CSS variables from `shared_tokens.md` for all colors.
- Support `data-theme="light"` and `data-theme="dark"` on the root element.
- Include a visible theme toggle in the UI.
- Fonts: `Boska` (display) and `Satoshi` (body).
