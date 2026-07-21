import type { IEvent } from '@genesis/contracts';

export type EventHandler<T extends IEvent> = (event: T) => Promise<void> | void;

export class EventSubscription<T extends IEvent> {
  public readonly eventType: string;
  public readonly handler: EventHandler<T>;
  public readonly once: boolean;

  private active = true;
  private readonly removeCallback: () => void;

  constructor(eventType: string, handler: EventHandler<T>, once: boolean, removeCallback: () => void) {
    this.eventType = eventType;
    this.handler = handler;
    this.once = once;
    this.removeCallback = removeCallback;
  }

  public unsubscribe(): void {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.removeCallback();
  }

  public isActive(): boolean {
    return this.active;
  }
}
