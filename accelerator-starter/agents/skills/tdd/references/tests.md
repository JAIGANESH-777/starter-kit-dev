# Test Examples

## What makes a good test?

A good test describes **behavior through public interfaces**. It reads like a specification.

### Good: Behavior-focused

```typescript
// ✅ Tests observable behavior through the public API
describe('CartService', () => {
  it('calculates total with tax for items in the cart', async () => {
    const cart = new CartService();
    cart.addItem({ name: 'Widget', price: 10.00, quantity: 2 });
    cart.addItem({ name: 'Gadget', price: 25.00, quantity: 1 });

    const total = cart.getTotal({ taxRate: 0.08 });

    expect(total).toBe(48.60);
  });

  it('returns zero total for empty cart', async () => {
    const cart = new CartService();
    const total = cart.getTotal({ taxRate: 0.08 });
    expect(total).toBe(0);
  });
});
```

### Bad: Implementation-coupled

```typescript
// ❌ Tests internal structure, not behavior
describe('CartService', () => {
  it('stores items in the internal array', () => {
    const cart = new CartService();
    cart.addItem({ name: 'Widget', price: 10.00, quantity: 2 });

    // Reaches into internals — breaks if data structure changes
    expect(cart._items).toHaveLength(1);
    expect(cart._items[0].name).toBe('Widget');
  });

  it('calls the tax calculator', () => {
    const mockTaxCalc = vi.fn().mockReturnValue(3.60);
    const cart = new CartService({ taxCalculator: mockTaxCalc });
    cart.addItem({ name: 'Widget', price: 10.00, quantity: 2 });

    cart.getTotal({ taxRate: 0.08 });

    // Tests that a specific collaborator was called — breaks on refactor
    expect(mockTaxCalc).toHaveBeenCalledWith(20.00, 0.08);
  });
});
```

## Integration-style tests

Prefer tests that exercise **real code paths**:

```typescript
// ✅ Tests the real handler, real validation, real response
describe('POST /api/users', () => {
  it('creates a user with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: 'test@example.com', name: 'Test User' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  it('rejects invalid email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: 'not-an-email', name: 'Test User' },
    });

    expect(response.statusCode).toBe(400);
  });
});
```

## Test naming conventions

Test names should read as **specifications**:

```
✅ "user can checkout with valid cart"
✅ "returns 404 when resource does not exist"
✅ "applies discount when coupon code is valid"

❌ "test checkout"
❌ "should work correctly"
❌ "handles the thing"
```
