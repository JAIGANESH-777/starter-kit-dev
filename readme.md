# 🛠️ Accelerator Enterprise Scaffolding & Agent Starter Kit

Welcome to the **Accelerator Enterprise Scaffolding & Agent Starter Kit**. This repository is an advanced, prompt-driven architecture compiler rather than a collection of static, bloated boilerplate files. By combining explicit structural constraints, dynamic configuration prompts, and custom AI agent skills, your team can scaffold and spin up perfectly configured, securely wired, multi-container full-stack workspaces in minutes.

---

## 🏛️ System Architecture Overview

This project is organized into two primary pillars: the **Compiler CLI & Templates** (`accelerator/`) and the **Custom AI Agent Skills** (`agents/`).

```text
Starter-Kit dev/
├── readme.md                   # This developer & architecture guide
└── accelerator-starter/
    ├── accelerator/            # The scaffolding engine, assets, and base config templates
    │   ├── ACCELERATOR_SPEC.md # Meta-spec documenting the scaffolding system rules
    │   ├── CLAUDE.md           # Guardrails and rules parsed by AI coding assistants
    │   ├── shared_tokens.md    # Reusable design tokens (colors, typography, spacing)
    │   ├── docker-compose.yml  # Base multi-container network & service orchestrator
    │   ├── assets/             # Brand identity resources (logos, favicons, fonts)
    │   │   ├── logo.svg
    │   │   ├── logo-mark.svg
    │   │   └── favicon.ico
    │   ├── prompts/            # Interactive prompt modules for the architecture compiler
    │   │   ├── installer.js    # CLI entrypoint script
    │   │   ├── index.js        # Form orchestrator
    │   │   ├── renderer.js     # Compiles prompt answers into markdown spec files
    │   │   ├── writer.js       # Writes the generated SPEC.md to disk
    │   │   └── [basics|frontend|backend|database|auth|infra|quality].js
    │   ├── specs/              # Target directory for stack-specific SPEC variants
    │   ├── snippets/           # Reusable snippets database for reference during scaffolding
    │   └── terraform/          # Cloud infrastructure modules (AWS, GCP, Azure)
    │
    └── agents/                 # Instructions and guardrails for AI coding assistants
        └── skills/             # Custom expert skills guiding agent scaffolding phases
```

---

## 🧠 Custom AI Agent Skills

To support automated scaffolding using AI coding assistants (such as Claude Code, Cursor, or Codex), the repository includes 9 specialized agent skills under `accelerator-starter/agents/skills/`. When invoking an AI agent to build, migrate, or extend features, reference these skills to guide the agent's behavior:

| Skill Directory | Purpose | When to Use |
| :--- | :--- | :--- |
| [`accelerator-scaffolder`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/accelerator-scaffolder/SKILL.md) | Translates target specs from `SPEC.md` to a multi-container environment. | Initial project bootstrapping and framework setup. |
| [`api-contract`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/api-contract/SKILL.md) | Enforces REST/GraphQL API contract designs, Swagger generation, and validation. | Designing backend controllers, resolvers, route versions, and DTOs. |
| [`db-migration`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/db-migration/SKILL.md) | Guides schema modeling, seed scripts, and safe database migration commands. | Defining database schemas or performing migrations. |
| [`devops-cloud`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/devops-cloud/SKILL.md) | Configures multi-stage Dockerfiles, CI/CD pipelines, and Terraform IaC modules. | Modifying deployment configurations, Docker setups, or pipelines. |
| [`frontend-design`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/frontend-design/SKILL.md) | Enforces beautiful, custom-tailored visual design guidelines and CSS patterns. | Building frontend layouts, styling custom themes, or styling UI cards. |
| [`security-hardening`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/security-hardening/SKILL.md) | Audits and secures backend APIs, CORS policies, rate limiting, and cookie flags. | Auditing security, handling JWTs, or managing environment variables. |
| [`state-ssr`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/state-ssr/SKILL.md) | Prevents Next.js/Nuxt hydration errors and isolates server state from client store cache. | Integrating state stores (Jotai, Zustand) or configuring App Router. |
| [`stack-doctor`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/stack-doctor/SKILL.md) | Diagnoses and resolves post-scaffold container conflicts and build failures. | Debugging start, build, connection, or framework issues. |
| [`tdd`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/tdd/SKILL.md) | Guides test-driven development cycles using red-green-refactor vertical slices. | Writing unit, integration, and E2E tests for features. |

---

## ⚡ Scaffolding Workflow

Scaffolding a new project is done in three main steps:

### 1. Compile Your Project Specification
First, navigate to the `accelerator` directory, install the CLI prompt dependencies, and run the compiler:

```bash
cd accelerator-starter/accelerator
npm install @inquirer/prompts chalk
node prompts/installer.js
```

Answer the interactive prompt series. The compiler will gather inputs on:
- **Basics**: Project name, type (full-stack, backend-only, frontend-only), and language.
- **Frontend**: Framework (Next.js, Vite+React, SvelteKit, Nuxt 3), styling, fetching, and state management.
- **Backend**: Framework (NestJS, FastAPI, Django, Express, Hono), validation, and features.
- **Database**: Database (PostgreSQL, SQLite, MySQL, MongoDB), ORM (Prisma, Drizzle, Django ORM, TypeORM, SQLAlchemy), and migrations.
- **Auth**: Strategy, provider, and roles.
- **Infra & DevOps**: Port setup, CI/CD platform, quality tools (ESLint, Prettier, Husky, SonarQube), and Terraform.
- **Quality**: Test frameworks and coverage checks.

The compiler outputs a custom, AI-readable `SPEC.md` directly into the current directory.

### 2. Instruct Your AI Agent
Copy the generated `SPEC.md`, `shared_tokens.md`, `CLAUDE.md`, `ACCELERATOR_SPEC.md`, and the custom `agents/skills/` guidelines into your target directory. Then, hand over instructions to your AI coding agent (e.g., Claude Code, Cursor, or Codex) with a prompt like:


### PROMPT
> *"Read these four files completely before writing any code, in this order:

1. ACCELERATOR_SPEC.md — meta-rules for how this scaffolding system works
2. CLAUDE.md — your operating guardrails for this specific build
3. SPEC.md — this project's actual stack choices, output by the CLI compiler
4. shared_tokens.md — the only valid source for colors, typography, spacing, radii

Do not start scaffolding until all four are read. If any of them conflict with each other on 
something load-bearing, stop and ask me rather than picking a winner yourself.

SPEC.md Section 8 is the literal, final directory structure — copy it, don't redesign or rename 
anything in it. SPEC.md Section 9 is the scaffold pipeline — execute it in the order given, do not 
reorder or skip steps even if a later step looks faster to do first.

Use agents/skills/ as a phase-by-phase playbook. Open the matching skill BEFORE starting each phase:
accelerator-scaffolder (bootstrap) → db-migration (schema) → api-contract (routes/controllers/DTOs) 
→ frontend-design + state-ssr (UI/state) → security-hardening (auth/CORS/cookies) → devops-cloud 
(Docker/CI) → tdd (write tests for each vertical slice as you build it, not after). Only open 
stack-doctor if something actually breaks post-scaffold.

These rules override SPEC.md if SPEC.md ever contradicts them:

1. (L-2) Backend first. Implement GET /api/health and confirm 
   `curl http://localhost:8000/api/health` returns 200 { status: "ok" } before touching frontend/.
2. (W-4) Every color/spacing/type value comes from shared_tokens.md — no invented values — and HEX 
   colors convert to HSL when wired into tailwind.config.ts (or framework equivalent).
3. (C-1) Frontend listens on 3000, backend on 8000. Container-to-container calls use service 
   hostnames (http://backend:8000) — never localhost inside a Docker container. Browser-side calls 
   use http://localhost:8000.
4. (C-2) (Applicable only if using Prisma + Postgres) Any Prisma + Postgres connection string uses postgresql://, with a runtime guard that 
   rewrites postgres:// to postgresql:// if an env var supplies the old prefix.
5. If SPEC.md Section 5 has Multi-Tenant: Yes, register tenant scoping globally at bootstrap using 
   the pattern that matches the chosen backend: NestJS → APP_INTERCEPTOR with TenantInterceptor in 
   app.module.ts providers; Express/Fastify/Hono → app.use(tenantMiddleware) before all routes, plus 
   @CurrentTenant() on tenant-scoped controllers; FastAPI → a get_tenant_id dependency that extracts 
   tenant_id from headers/claims and scopes the DB session; Django → TenantMiddleware using 
   thread-local/context vars plus a custom Model Manager that auto-filters by tenant_id. Every single 
   DB query touching tenant data must be scoped to the active tenant — no exceptions, no "just this 
   one admin query." If the selected backend matches none of the above, stop and ask me rather than 
   inventing a pattern.
6. Build a distinct UI for every auth method listed in Section 5 — don't default everything to 
   email/password. Magic Link = email input + send button only. OTP/SMS = phone input → separate 
   6-digit code step. OAuth = branded provider button per provider.
7. Never hardcode secrets — only .env.example. Never modify the root docker-compose.yml directly; 
   use the generated service config from Section 6 as-is.

Pull logo.svg, logo-mark.svg, and favicon.ico from assets/ into the frontend — don't generate 
placeholders. Apply tokens via CSS variables only, with a visible theme toggle switching 
data-theme="light"/"dark" on the root element.

Before calling the scaffold done, verify: the health check passes, frontend boots with zero 
hydration warnings, the database is reachable through the configured ORM, tenant-scoped queries 
actually filter by tenant_id (spot-check at least one), and `docker-compose up` brings up the full 
stack with no manual intervention."*



### 3. Let the Agent Scaffold & Validate
The agent will build out the vertical slices step-by-step. The process follows strict guidelines to ensure quality, security, and consistent styling.

---

## 🛡️ Critical Scaffolding Guardrails & Rules

Every AI agent and developer working in this workspace must adhere to the following rules:

> [!IMPORTANT]
> **L-2 Verification Rule (Backend-First)**
> Implement the backend bootstrap first. You must write the `GET /api/health` router check and verify that `curl http://localhost:8000/api/health` returns HTTP 200 `{ status: "ok" }` before writing a single line of frontend code.

> [!TIP]
> **W-4 Styling Fix (Design Tokens)**
> Read the system tokens directly from `shared_tokens.md`. When mapping HEX colors to a framework configuration (such as `tailwind.config.ts`), convert them to CSS HSL fragments to allow light and dark themes to render and override correctly.

> [!NOTE]
> **C-1 Port Isolation Rule**
> The frontend container process must expose and listen on port `3000`. The backend container process must expose and listen on port `8000`. Inter-container calls must use service hosts (e.g., `http://backend:8000/api`), whereas client-side browser calls use `http://localhost:8000/api`.

> [!WARNING]
> **C-2 Database Connection Rule (Prisma + PostgreSQL only)**
> When using Prisma with a PostgreSQL container, the schema connection protocol MUST use postgresql:// (e.g., postgresql://postgres:postgres@db:5432/appdb). Using postgres:// causes Prisma configuration compilation to fail. Write a runtime handler to replace the protocol prefix if environment variables pass it down with postgres://.
