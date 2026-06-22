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
- **FastAPI / Python OAuth Session Requirements**: If using OAuth auth methods with FastAPI/Starlette, always install `itsdangerous` in `requirements.txt` and register `SessionMiddleware` from `starlette.middleware.sessions` in `app/main.py` using `settings.JWT_SECRET` as the secret key.
- **Pydantic Validation Dependencies**: If using Pydantic v2 validation with `EmailStr` fields, always add `email-validator` to `requirements.txt`.
- **HTTPX Client Testing Requirements**: If using `pytest` with `httpx` async test client, use `ASGITransport(app=app)` instead of directly passing `app` to `AsyncClient` to remain compliant with HTTPX 0.28+ APIs.
- **SQLite Async Testing Dependencies**: If using async SQLAlchemy with in-memory SQLite (`sqlite+aiosqlite:///:memory:`) for testing, always add `aiosqlite` to `requirements.txt`.
- Implement **every auth method** listed in SPEC Section 5 with its own distinct UI — do not default to email/password for all methods. Magic Link → email input + "Send Magic Link" button only; OTP/SMS → phone input → 6-digit code two-step form; OAuth → branded provider button.

## L-2 Verification Step

Implement `GET /api/health` → `{ status: "ok" }` in the backend.
**Verify it returns HTTP 200 before writing a single frontend component.**

## Design Tokens

- Use `--color-*` CSS variables from `shared_tokens.md` for all colors.
- Support `data-theme="light"` and `data-theme="dark"` on the root element.
- Include a visible theme toggle in the UI.
- Fonts: `Boska` (display) and `Satoshi` (body).

## Python-Specific Rules (applies when `Primary Language: Python` in SPEC.md)

- **MySQL async dialect**: When DB is MySQL and ORM is SQLAlchemy, always set `DATABASE_URL=mysql+aiomysql://user:pass@db:3306/appdb`. The `mysql://` prefix is sync-only and will cause `create_async_engine()` to fail. Install `aiomysql` in `requirements.txt`.
- **Python Dockerfile base image**: Use `python:3.12-slim`, NOT `python:3.12-alpine`. Alpine uses musl libc which lacks pre-compiled wheels for `cryptography`, `aiomysql`, and `greenlet`. Use slim (Debian-based) to avoid build failures.
- **Alembic async env.py**: The default `alembic init` scaffold is synchronous. Replace `alembic/env.py` with the async version using `run_async_migrations()` and `AsyncEngine.connect()`. The default sync env will crash with `MissingGreenlet` errors.
- **Celery in Docker**: When Background Queues is enabled, add a separate `celery` service to `docker-compose.yml` sharing the same `env_file` and network as `backend`. Command: `celery -A app.core.celery_app worker --loglevel=info`. Must `depend_on` the `redis` service.
- **Redis caching (Python)**: Use `redis.asyncio` (from the `redis` package), not `ioredis`. Create `app/core/redis.py` with `redis.asyncio.from_url(REDIS_URL, retry_on_timeout=True)`.
- **Email service (Python)**: Default to Azure/Microsoft Graph API for mail delivery.
- **File uploads (Python)**: Use `boto3` + `python-multipart`. Do NOT use `@aws-sdk/client-s3` or `multer`.
- **WebSockets (FastAPI)**: Use FastAPI's native `@router.websocket()` — no extra package needed. Do NOT install `socket.io`.
- **WebSockets (Django)**: Install `channels channels-redis`. Replace `asgi.py` with `ProtocolTypeRouter`.

