import type { IEvent } from '@genesis/contracts';
import { EventSubscription } from './EventSubscription.js';
import type { EventHandler } from './EventSubscription.js';

export class EventBus {
  private readonly subscriptions = new Map<string, Set<EventSubscription<IEvent>>>();

  public publish<T extends IEvent>(event: T): Promise<void> {
    const handlers = this.subscriptions.get(event.type);

    if (handlers === undefined || handlers.size === 0) {
      return Promise.resolve();
    }

    return this.dispatch(event, Array.from(handlers));
  }

  public subscribe<T extends IEvent>(eventType: string, handler: EventHandler<T>): EventSubscription<T> {
    const subscriptions = this.subscriptions.get(eventType) ?? new Set<EventSubscription<IEvent>>();
    this.subscriptions.set(eventType, subscriptions);

    const subscription = new EventSubscription<T>(eventType, handler, false, () => {
      subscriptions.delete(subscription as unknown as EventSubscription<IEvent>);
    });

    subscriptions.add(subscription as unknown as EventSubscription<IEvent>);

    return subscription;
  }

  public once<T extends IEvent>(eventType: string, handler: EventHandler<T>): EventSubscription<T> {
    const subscriptions = this.subscriptions.get(eventType) ?? new Set<EventSubscription<IEvent>>();
    this.subscriptions.set(eventType, subscriptions);

    const subscription = new EventSubscription<T>(eventType, handler, true, () => {
      subscriptions.delete(subscription as unknown as EventSubscription<IEvent>);
    });

    subscriptions.add(subscription as unknown as EventSubscription<IEvent>);

    return subscription;
  }

  public unsubscribe<T extends IEvent>(subscription: EventSubscription<T>): void {
    subscription.unsubscribe();
  }

  private async dispatch<T extends IEvent>(event: T, handlers: EventSubscription<IEvent>[]): Promise<void> {
    for (const subscription of handlers) {
      if (!subscription.isActive()) {
        continue;
      }

      try {
        const handler = subscription.handler as EventHandler<T>;
        await Promise.resolve(handler(event as T));
      } finally {
        if (subscription.once) {
          subscription.unsubscribe();
        }
      }
    }
  }
}
