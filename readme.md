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

To support automated scaffolding using AI coding assistants (such as Claude Code, Cursor, or Codex), the repository includes 8 specialized agent skills under `accelerator-starter/agents/skills/`. When invoking an AI agent to build, migrate, or extend features, reference these skills to guide the agent's behavior:

| Skill Directory | Purpose | When to Use |
| :--- | :--- | :--- |
| [`accelerator-scaffolder`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/accelerator-scaffolder/SKILL.md) | Translates target specs from `SPEC.md` to a multi-container environment. | Initial project bootstrapping and framework setup. |
| [`api-contract`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/api-contract/SKILL.md) | Enforces REST API contract standards, OpenAPI generation, and payload formats. | Designing backend controllers, route versions, and DTOs. |
| [`db-migration`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/db-migration/SKILL.md) | Guides schema modeling, seed scripts, and safe database migration commands. | Defining database schemas or performing migrations. |
| [`devops-cloud`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/devops-cloud/SKILL.md) | Configures multi-stage Dockerfiles, CI/CD pipelines, and Terraform IaC modules. | Modifying deployment configurations, Docker setups, or pipelines. |
| [`frontend-design`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/frontend-design/SKILL.md) | Enforces beautiful, custom-tailored visual design guidelines and CSS patterns. | Building frontend layouts, styling custom themes, or styling UI cards. |
| [`security-hardening`](file:///c:/Projects/Starter-Kit%20dev/accelerator-starter/agents/skills/security-hardening/SKILL.md) | Audits and secures backend APIs, CORS policies, rate limiting, and cookie flags. | Auditing security, handling JWTs, or managing environment variables. |
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
Copy the generated `SPEC.md`, `shared_tokens.md`, `CLAUDE.md`, and the custom `agents/skills/` guidelines into your target directory. Then, hand over instructions to your AI coding agent (e.g., Claude Code, Cursor, or Codex) with a prompt like:

> *"Read CLAUDE.md, SPEC.md, and shared_tokens.md completely. Reference the agents/skills/ directory. Bootstrap the backend/ and frontend/ folders in this project directory following the exact scaffold pipeline in SPEC.md."*

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
> **C-2 Database Connection Rule**
> When using Prisma with a PostgreSQL container, the schema connection protocol MUST use `postgresql://` (e.g., `postgresql://postgres:postgres@db:5432/appdb`). Using `postgres://` causes Prisma configuration compilation to fail. Write a runtime handler to replace the protocol prefix if environment variables pass it down with `postgres://`.
