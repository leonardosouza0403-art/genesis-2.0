import { ModuleId } from '@genesis/contracts';
import type { LifecycleState } from './LifecycleTransition.js';
import { LifecycleStates, assertValidTransition, isLifecycleState } from './LifecycleTransition.js';

export class LifecycleManager {
  private readonly states = new Map<string, LifecycleState>();

  public register(moduleId: ModuleId, initialState: LifecycleState = LifecycleStates.Created): void {
    const key = moduleId.toString();

    if (this.states.has(key)) {
      throw new Error(`Module '${key}' is already registered in the lifecycle manager.`);
    }

    if (!isLifecycleState(initialState)) {
      throw new Error(`Invalid initial lifecycle state '${initialState}'.`);
    }

    this.states.set(key, initialState);
  }

  public getState(moduleId: ModuleId): LifecycleState | undefined {
    return this.states.get(moduleId.toString());
  }

  public transition(moduleId: ModuleId, nextState: LifecycleState): LifecycleState {
    const key = moduleId.toString();
    const currentState = this.states.get(key);

    if (currentState === undefined) {
      throw new Error(`Module '${key}' is not registered in the lifecycle manager.`);
    }

    if (!isLifecycleState(nextState)) {
      throw new Error(`Invalid lifecycle state '${nextState}'.`);
    }

    assertValidTransition(currentState, nextState);
    this.states.set(key, nextState);

    return nextState;
  }

  public remove(moduleId: ModuleId): boolean {
    return this.states.delete(moduleId.toString());
  }

  public getAllStates(): ReadonlyMap<string, LifecycleState> {
    return new Map(this.states);
  }
}
