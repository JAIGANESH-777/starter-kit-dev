---
name: security-hardening
description: Audit, secure, and harden full-stack applications. Enforce strict CORS configurations, secure HTTP headers, protected cookie states, API rate limiting, robust request validations, and zero-leak secrets management.
---

# Security Hardening Skill

This skill teaches the coding agent how to identify, patch, and prevent security vulnerabilities in scaffolded projects. The agent must enforce strict security baselines across the database, api services, and client tiers.

---

## 1. Network & Origin Controls (CORS)

Cross-Origin Resource Sharing (CORS) must be configured explicitly. **Never use wildcard origins (`*`)** for backend APIs that require authentication or process user-specific data.

### CORS Rules
1. **Dynamic Origin Matching**: Read `ALLOWED_ORIGINS` from environment variables as a comma-separated list.
2. **Credentials Handling**: If `Access-Control-Allow-Credentials` is set to `true`, the origin header **cannot** be a wildcard (`*`).
3. **Safe Defaults**: Expose only the necessary HTTP headers (e.g., `Content-Type`, `Authorization`, `X-Requested-With`).

### Example Implementation (Express)
```javascript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or local docker service calls (which send no origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 2. HTTP Security Headers (Helmet)

Always hide technology stacks (e.g., the `X-Powered-By` header) and force secure protocol configurations to block Clickjacking, MIME sniffing, and Cross-Site Scripting (XSS).

### Required Headers Configuration
* **Node (Express / NestJS)**: Install and use `helmet`.
* **Python (Django / FastAPI)**: Enforce standard security middleware settings.

| Header | Purpose | Recommended Setting |
| :--- | :--- | :--- |
| `X-Content-Type-Options` | Prevent MIME-type sniffing | `nosniff` |
| `X-Frame-Options` | Block clickjacking | `DENY` or `SAMEORIGIN` |
| `Content-Security-Policy` (CSP) | Restrict resource loaders | Strict script-src / object-src constraints |
| `Strict-Transport-Security` (HSTS) | Enforce HTTPS | `max-age=63072000; includeSubDomains; preload` (Prod only) |
| `X-XSS-Protection` | Legacy XSS filter | `0` (Disabled in favor of CSP) |

---

## 3. Session & Cookie Isolation

To protect against Cross-Site Scripting (XSS) and Session Hijacking, sensitive session tokens (like JWTs or Session IDs) must never be stored in client-side readable storage like `localStorage` or `sessionStorage`.

### Cookie Hardening Rules
When writing session cookies, always apply these attributes:
1. **`httpOnly: true`**: Blocks JavaScript access to the cookie, mitigating XSS theft.
2. **`secure: true`**: Forces cookie transmission only over encrypted HTTPS links. (Set to `false` only in local HTTP development environment).
3. **`sameSite: 'strict'`** (or `'lax'`): Mitigates Cross-Site Request Forgery (CSRF) attacks.

```javascript
res.cookie('token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
});
```

---

## 4. Input Validation & Parameterized Queries

Every input coming from a client is untrusted. SQL injections and remote code executions happen when dynamic strings are evaluated directly without filtering.

### Security Rules
1. **Strong Schema Parsing**: Parse every input payload (params, query, body) using validation libraries (Zod, Pydantic) before processing them in databases or services.
2. **Parameterized DB Queries**: Use ORM utilities (Prisma, Drizzle, Django ORM, SQLAlchemy) which parameterize queries by default.
3. **Raw SQL Guard**: If raw SQL is mandatory, never construct queries using string concatenation. Use bindings:
   ```typescript
   // ❌ UNSAFE
   await prisma.$queryRawUnsafe(`SELECT * FROM Users WHERE id = '${userInput}'`);

   // ✅ SAFE (Parameterized)
   await prisma.$queryRaw`SELECT * FROM Users WHERE id = ${userInput}`;
   ```

---

## 5. Rate Limiting

Protect public and authentication routes against Brute Force and Denial of Service (DoS) attacks.

### API Rate Limiting Config
* **Auth Tier (`/api/auth/*`)**: Limit login and registration to 5 attempts per 15 minutes per IP.
* **Global API Tier**: Limit general routes to 100 requests per minute per IP.

### Example Configuration (FastAPI)
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/auth/login")
@limiter.limit("5/15minute")
def login(request: Request):
    return {"message": "Success"}
```

---

## 6. Secrets Management & Logging Guard

Exposing database credentials or API keys in code repositories is a critical security failure.

### Secrets Protection Rules
- **No Staged Secrets**: Verify that `.env` files are added to `.gitignore`. Never commit them to version control.
- **Provide Placeholders Only**: Populate `.env.example` with dummy values (e.g. `DATABASE_URL=postgresql://user:pass@host:port/db`).
- **Sanitize Error Logs**: Never print raw database connection strings, passwords, or JWT payloads inside console loggers. Use standard logging serializers to mask sensitive fields.
- **Client Bundle Check**: When configuring Vite or Next.js, verify that environment variables containing backend secret keys do **not** use prefixes (like `NEXT_PUBLIC_` or `VITE_`) that expose them to frontend client bundles.
