import { GenesisId, GenesisVersion, type IEvent } from '@genesis/contracts';
import { GenesisKernel } from '@genesis/core';
import { RuntimeState } from './RuntimeState.js';
import type { RuntimeContext } from './RuntimeContext.js';

const RuntimeBootingEventType = 'RuntimeBooting' as const;
const RuntimeStartedEventType = 'RuntimeStarted' as const;
const RuntimeStoppingEventType = 'RuntimeStopping' as const;
const RuntimeStoppedEventType = 'RuntimeStopped' as const;
const RuntimeFailedEventType = 'RuntimeFailed' as const;

export class GenesisRuntime {
  private state = RuntimeState.Created;
  private readonly kernel = new GenesisKernel(GenesisId.create('genesis-runtime'), GenesisVersion.create('1.0.0'));

  public status(): RuntimeState {
    return this.state;
  }

  public async boot(): Promise<void> {
    if (this.state === RuntimeState.Running || this.state === RuntimeState.Booting) {
      return;
    }

    this.updateState(RuntimeState.Booting);
    await this.publishEvent(RuntimeBootingEventType);

    try {
      await this.kernel.boot();
      this.updateState(RuntimeState.Running);
      await this.publishEvent(RuntimeStartedEventType);
    } catch (error) {
      this.updateState(RuntimeState.Failed);
      await this.publishEvent(RuntimeFailedEventType);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.state !== RuntimeState.Running) {
      return;
    }

    this.updateState(RuntimeState.Stopping);
    await this.publishEvent(RuntimeStoppingEventType);

    try {
      await this.kernel.shutdown();
      this.updateState(RuntimeState.Stopped);
      await this.publishEvent(RuntimeStoppedEventType);
    } catch (error) {
      this.updateState(RuntimeState.Failed);
      await this.publishEvent(RuntimeFailedEventType);
      throw error;
    }
  }

  public async restart(): Promise<void> {
    await this.shutdown();
    await this.boot();
  }

  public getContext(): RuntimeContext {
    return {
      kernel: this.kernel,
      configurationManager: this.kernel.configurationManager,
      moduleLoader: this.kernel.moduleLoader,
      lifecycleManager: this.kernel.lifecycleManager,
      eventBus: this.kernel.eventBus,
    };
  }

  private updateState(nextState: RuntimeState): void {
    this.state = nextState;
  }

  private publishEvent(type: string): Promise<void> {
    const event: IEvent = {
      id: this.kernel.id,
      occurredAt: new Date(),
      type,
      payload: Object.freeze({ state: this.state }),
    };

    return this.kernel.eventBus.publish(event);
  }
}
