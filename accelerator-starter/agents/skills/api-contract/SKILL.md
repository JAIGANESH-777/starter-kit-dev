---
name: api-contract
description: Enforce REST API contract designs, standardize success/error JSON response payloads, manage versioned routing, implement uniform pagination structures, and maintain auto-generated OpenAPI/Swagger specifications.
---

# API Contract & Validation Skill

This skill teaches the coding agent how to design, build, and enforce strict, predictable API contracts. A standardized contract ensures that frontends and backends speak the same interface language without payload mismatches or runtime errors.

---

## 1. Unified API Response Wrapper

All API endpoints must wrap response payloads in a consistent JSON shell. Client applications expect this exact format to parse data, metadata, and error structures predictably.

### Response Contract Rules
Every response from the server must return an object with three root keys:
1. **`data`**: The payload containing resources. Holds the requested object or array on success; must be `null` on failure.
2. **`error`**: The error details. Must be `null` on success; holds error details (`code`, `message`, and optional validation `details`) on failure.
3. **`meta`**: Utility metadata. Always includes `timestamp` (ISO format). Includes `pagination` metadata for lists.

### Standard Response Envelope (JSON Schema)
```json
{
  "data": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable summary",
    "details": []
  },
  "meta": {
    "timestamp": "2026-06-11T09:15:07.123Z"
  }
}
```

---

## 2. Standardized Error Payloads & HTTP Mappings

Errors must return an appropriate HTTP Status Code along with a structured response payload detailing what went wrong.

### Validation Errors (422 Unprocessable Entity)
When schema validation fails (Zod/Pydantic), the response must list all fields that failed checks in the `error.details` array.

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation failed",
    "details": [
      { "field": "email", "issue": "Invalid email format" },
      { "field": "password", "issue": "Must be at least 8 characters long" }
    ]
  },
  "meta": {
    "timestamp": "2026-06-11T09:15:07.123Z"
  }
}
```

### Common HTTP Mappings
* **`400 Bad Request`**: Client sent malformed JSON/payload.
* **`401 Unauthorized`**: Token is missing, expired, or invalid.
* **`403 Forbidden`**: Authenticated user lacks RBAC roles for this action.
* **`404 Not Found`**: Resource does not exist.
* **`429 Too Many Requests`**: Rate limiting exceeded.
* **`500 Internal Server Error`**: Unexpected database or code exception.

---

## 3. Uniform Pagination Pattern

When querying tables for lists, pagination must be requested via standardized parameters and returned with standard paging metadata.

### Input Query Schema
* **`page`**: The index offset (1-based, default `1`).
* **`limit`**: Page size limit (default `10`, maximum constraint of `100` to prevent database memory overload).

### Output Meta Schema
For list endpoints, the `meta` object must contain a nested `pagination` block:

```json
{
  "data": [ ... ],
  "error": null,
  "meta": {
    "timestamp": "2026-06-11T09:15:07.123Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 45,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

## 4. API Versioning

API endpoints must be prefixed with version routes to allow updates without breaking old app clients in production.

* **Versioning Rule**: Prefix all API routes with `/api/v1/` (e.g., `/api/v1/auth/login`, `/api/v1/users/profile`).
* **NestJS Configuration**: Enforce versioning globally at bootstrap:
  ```typescript
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  ```
* **FastAPI Configuration**: Use router routing tags:
  ```python
  app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
  ```

---

## 5. OpenAPI / Swagger Documentation

Ensure that every controller, module, or route is declared with descriptions, sample request schemas, and response types so the system can compile accurate Swagger documentation.

### Documentation Requirements
1. **Interactive Route UI**: Serve Swagger documentation at the `/docs` or `/swagger` route.
2. **Schema Models**: Decorate models/DTOs (using NestJS Swagger decorators or Pydantic schemas) with property summaries and formatting constraints.
3. **No undocumented endpoints**: Every public API route must declare its status codes and response bodies.
