---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [references/tests.md](references/tests.md) for examples and [references/mocking.md](references/mocking.md) for mocking guidelines.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

When exploring the codebase, use the project's domain glossary so that test names and interface vocabulary match the project's language, and respect ADRs in the area you're touching.

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for [deep modules](references/deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](references/interface-design.md)
- [ ] List the behaviors to test (not implementation steps)
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
Refactor: Clean up the code you just wrote immediately while it's still fresh.
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for [refactor candidates](references/refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```

---

## Python Supplement — pytest + FastAPI Testing

When working on Python projects (`language: Python` in SPEC.md), apply the same TDD philosophy using pytest + httpx. The patterns below are the Python equivalent of the TypeScript examples above.

### Setup

```bash
pip install pytest pytest-asyncio httpx aiosqlite
```

```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"   # no need to add @pytest.mark.asyncio to every test
testpaths = ["backend/test"]
```

### Tracer Bullet — First Test (RED → GREEN)

```python
# backend/test/test_health.py
# RED: Write this first — it will fail until the /api/health route exists
async def test_health_returns_ok(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

# GREEN: In app/routers/health.py, implement:
# @router.get("/health")
# async def health():
#     return {"status": "ok"}
```

### Fixture Pattern (from `conftest.py`)

```python
# backend/test/conftest.py
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.base import Base
from app.core.dependencies import get_db

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture
async def db_session(test_engine):
    async_session = async_sessionmaker(bind=test_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()  # isolate each test

@pytest_asyncio.fixture
async def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

### Vertical Slices — Feature TDD

```python
# backend/test/test_users.py

# ── RED: write the test first ─────────────────────────────────────────────────
async def test_create_user_returns_201(client):
    response = await client.post("/api/users", json={
        "email": "alice@example.com",
        "password": "secure-password",
    })
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["email"] == "alice@example.com"
    assert "password" not in data           # never return raw password
    assert "hashed_password" not in data    # never return hash either

# ── GREEN: implement the minimum router + service to pass ────────────────────
# ── REFACTOR: extract user creation into UserService, clean up ───────────────

async def test_duplicate_email_returns_409(client):
    await client.post("/api/users", json={"email": "bob@example.com", "password": "pw"})
    response = await client.post("/api/users", json={"email": "bob@example.com", "password": "pw"})
    assert response.status_code == 409
```

### Anti-Pattern: Testing Implementation Details

```python
# ❌ WRONG: tests implementation, not behavior
async def test_user_service_calls_repository(monkeypatch):
    mock_repo = AsyncMock()
    monkeypatch.setattr("app.services.user_service.user_repo", mock_repo)
    await user_service.create(email="x@y.com", password="pw")
    mock_repo.save.assert_called_once()  # breaks if you rename .save() → .persist()

# ✅ CORRECT: tests behavior through the public API
async def test_user_is_persisted_after_creation(client, db_session):
    await client.post("/api/users", json={"email": "x@y.com", "password": "pw"})
    result = await db_session.execute(select(User).where(User.email == "x@y.com"))
    assert result.scalar_one_or_none() is not None
```
