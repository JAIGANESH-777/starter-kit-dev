# Interface Design for Testability

## Principle: Design for the caller, not the implementer

A good interface makes the **common case simple** and the **complex case possible**. It should be obvious how to use correctly and difficult to use incorrectly.

## Testable interface patterns

### 1. Dependency Injection

Accept dependencies through the constructor, not through imports or globals:

```typescript
// ✅ Testable — dependencies are injectable
class OrderService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly mailer: MailerClient,
  ) {}

  async placeOrder(order: Order): Promise<OrderResult> {
    const saved = await this.db.orders.create(order);
    await this.mailer.send(order.userEmail, 'order_confirmed', saved);
    return saved;
  }
}

// Test can inject fakes
const service = new OrderService(fakeDb, fakeMailer);
```

```typescript
// ❌ Hard to test — imports are hardcoded
import { db } from '../database';
import { sendEmail } from '../mailer';

async function placeOrder(order: Order) {
  const saved = await db.orders.create(order);
  await sendEmail(order.userEmail, 'order_confirmed', saved);
  return saved;
}
```

### 2. Return values over side effects

Functions that return values are easier to test than those that mutate state:

```typescript
// ✅ Returns a value — easy to assert
function applyDiscount(price: number, code: string): number {
  if (code === 'SAVE20') return price * 0.8;
  return price;
}

// ❌ Mutates in place — harder to verify
function applyDiscount(cart: Cart, code: string): void {
  if (code === 'SAVE20') cart.total *= 0.8;
}
```

### 3. Separate decisions from actions

Split "what to do" from "doing it":

```typescript
// ✅ Decision is pure and testable
function decideNotificationChannel(user: User): 'email' | 'sms' | 'push' {
  if (user.preferences.push && user.hasApp) return 'push';
  if (user.phone) return 'sms';
  return 'email';
}

// Action is a thin wrapper
async function sendNotification(user: User, message: string) {
  const channel = decideNotificationChannel(user);
  await channels[channel].send(user, message);
}
```

### 4. Explicit over implicit

Make inputs and outputs explicit rather than relying on hidden context:

```typescript
// ✅ Explicit inputs
function calculateShipping(weight: number, destination: string, expedited: boolean): number

// ❌ Hidden dependencies
function calculateShipping(): number {
  // reads from global config, current user session, and environment variables
}
```

## Design smells that hurt testability

| Smell | Problem | Fix |
|:---|:---|:---|
| Global state | Tests interfere with each other | Use dependency injection |
| Hard-coded dependencies | Can't substitute fakes | Accept via constructor |
| God objects | Too many responsibilities | Split into focused classes |
| Temporal coupling | Methods must be called in order | Enforce through the type system |
| Feature envy | Method uses another object's data more than its own | Move the method |
