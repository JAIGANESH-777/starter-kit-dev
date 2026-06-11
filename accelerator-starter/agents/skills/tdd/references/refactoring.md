# Refactoring Guide

## When to refactor

Refactor **only when GREEN** — all tests pass. Never refactor while any test is failing.

The REFACTOR step happens after each RED→GREEN cycle, not as a separate phase at the end.

## Refactoring checklist

After getting a test to pass, evaluate:

- [ ] **Duplication**: Is there repeated code that can be extracted?
- [ ] **Naming**: Do names accurately describe intent?
- [ ] **Single Responsibility**: Does each function/class do one thing?
- [ ] **Deep modules**: Can the interface be simplified while keeping behavior?
- [ ] **Dead code**: Is there unreachable or unused code?
- [ ] **Complexity**: Can nested conditionals be flattened?
- [ ] **Coupling**: Are modules depending on each other's internals?

## Common refactoring patterns

### Extract Method
When a block of code does something identifiable, extract it:

```typescript
// Before
function processOrder(order: Order) {
  // validate
  if (!order.items.length) throw new Error('Empty');
  if (order.items.some(i => i.quantity <= 0)) throw new Error('Invalid quantity');

  // calculate
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

// After
function processOrder(order: Order) {
  validateOrder(order);
  return calculateTotal(order);
}
```

### Replace Conditional with Polymorphism
When a switch/if-else selects behavior based on type:

```typescript
// Before
function getPrice(product: Product) {
  switch (product.type) {
    case 'digital': return product.basePrice;
    case 'physical': return product.basePrice + product.shippingCost;
    case 'subscription': return product.basePrice / 12;
  }
}

// After — each product type knows its pricing
interface Priceable {
  getPrice(): number;
}
```

### Inline Unnecessary Abstraction
If a wrapper adds no value, remove it:

```typescript
// Before — unnecessary wrapper
class UserRepository {
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

// After — if this is the only usage and no extra logic is needed,
// use Prisma directly. Only add the repository when it earns its keep.
```

## Rules during refactoring

1. **Run tests after each change** — not after a batch of changes
2. **Small steps** — one refactoring move at a time
3. **No new behavior** — refactoring changes structure, not functionality
4. **If tests break** — your refactoring changed behavior; revert and try again
