# Mocking Guidelines

## The Rule: Mock at Boundaries, Not Within

Mock **external systems** (databases, APIs, file systems, clocks). Do NOT mock **internal collaborators** (your own services, helpers, utilities).

### Why?

When you mock internal collaborators, your tests become coupled to implementation. Refactoring an internal module shouldn't break tests if the external behavior hasn't changed.

## When to mock

| Mock this | Why |
|:---|:---|
| External HTTP APIs | Unreliable, slow, and you don't control them |
| Database (only when necessary) | Use in-memory or test database instead when possible |
| System clock / `Date.now()` | Deterministic test output |
| File system I/O | Avoid test pollution |
| Third-party SDKs | Rate limits, credentials, flakiness |

## When NOT to mock

| Don't mock this | Why |
|:---|:---|
| Your own services/classes | Tests should exercise real code paths |
| Internal helper functions | They're implementation details |
| Data transformation logic | Test the actual transformation |
| Validation logic | Test real validation, not mocked results |

## Example: Boundary mock

```typescript
// ✅ Mock the external API boundary only
describe('WeatherService', () => {
  it('returns formatted forecast', async () => {
    // Mock the HTTP boundary
    const mockHttp = {
      get: vi.fn().mockResolvedValue({
        data: { temp: 72, conditions: 'sunny' },
      }),
    };

    const service = new WeatherService(mockHttp);
    const forecast = await service.getForecast('NYC');

    // Test the real formatting logic
    expect(forecast).toBe('NYC: 72°F, Sunny');
  });
});
```

## Example: Over-mocking (anti-pattern)

```typescript
// ❌ Mocking internal collaborators
describe('WeatherService', () => {
  it('calls formatter', async () => {
    const mockFormatter = vi.fn().mockReturnValue('NYC: 72°F, Sunny');
    const mockHttp = { get: vi.fn().mockResolvedValue({ data: {} }) };

    const service = new WeatherService(mockHttp, mockFormatter);
    await service.getForecast('NYC');

    // This just tests wiring, not behavior
    expect(mockFormatter).toHaveBeenCalled();
  });
});
```

## Test doubles hierarchy

Prefer the lightest-weight option:

1. **Real object** — always first choice
2. **In-memory fake** — simple implementation of an interface (e.g., in-memory DB)
3. **Stub** — returns canned responses
4. **Mock** — verifies interactions (use sparingly)
5. **Spy** — wraps real object to observe calls (use at boundaries only)
