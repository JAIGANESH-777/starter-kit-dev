# Deep Modules

## Concept

A **deep module** has a simple interface that hides significant implementation complexity. The opposite — a **shallow module** — has an interface nearly as complex as its implementation, adding layers without reducing cognitive load.

> "The best modules are those whose interfaces are much simpler than their implementations."
> — John Ousterhout, *A Philosophy of Software Design*

## Why deep modules help TDD

- **Small interface** = fewer tests needed to cover the public API
- **Deep implementation** = the module handles complexity internally, so tests stay simple
- **Stable interface** = refactoring internals doesn't break tests

## Example: Deep module

```typescript
// ✅ Simple interface, deep implementation
class NotificationService {
  /**
   * Send a notification to a user.
   * Internally handles: channel selection, templating, rate limiting,
   * retry logic, delivery tracking, and preference checking.
   */
  async notify(userId: string, event: NotificationEvent): Promise<void> {
    // ... 200 lines of internal complexity
  }
}

// Test is simple because the interface is simple
it('sends notification for order confirmation', async () => {
  await notificationService.notify(userId, { type: 'order_confirmed', orderId: '123' });
  // Assert the user received the notification through any channel
});
```

## Example: Shallow module (anti-pattern)

```typescript
// ❌ Interface exposes all the complexity
class NotificationService {
  async selectChannel(userId: string): Promise<Channel> { /* ... */ }
  async loadTemplate(event: string, channel: Channel): Promise<string> { /* ... */ }
  async checkRateLimit(userId: string): Promise<boolean> { /* ... */ }
  async send(channel: Channel, template: string, userId: string): Promise<void> { /* ... */ }
  async trackDelivery(notificationId: string): Promise<void> { /* ... */ }
}

// Tests now need to orchestrate all the steps — fragile and coupled
```

## Identifying opportunities

When writing code in the RED→GREEN→REFACTOR cycle, look for:

1. **Multiple sequential calls** to the same object → combine into one deeper method
2. **Callers duplicating logic** → push the logic into the module
3. **Pass-through methods** that just forward to another object → eliminate the intermediary
4. **Configuration explosion** → provide sensible defaults with optional overrides
