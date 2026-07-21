import { ModuleState } from '@genesis/contracts';

export type LifecycleState = ModuleState | 'created' | 'stopping';

export const LifecycleStates = {
  Created: 'created' as const,
  Initializing: ModuleState.Initializing,
  Running: ModuleState.Running,
  Stopping: 'stopping' as const,
  Stopped: ModuleState.Stopped,
  Failed: ModuleState.Failed
};

const transitions: Array<readonly [LifecycleState, readonly LifecycleState[]]> = [
  [LifecycleStates.Created, [LifecycleStates.Initializing, LifecycleStates.Failed]],
  [LifecycleStates.Initializing, [LifecycleStates.Running, LifecycleStates.Failed]],
  [LifecycleStates.Running, [LifecycleStates.Stopping, LifecycleStates.Failed]],
  [LifecycleStates.Stopping, [LifecycleStates.Stopped, LifecycleStates.Failed]],
  [LifecycleStates.Stopped, [LifecycleStates.Initializing, LifecycleStates.Failed]],
  [LifecycleStates.Failed, [LifecycleStates.Initializing]]
];

export const VALID_LIFECYCLE_TRANSITIONS: ReadonlyMap<LifecycleState, readonly LifecycleState[]> = new Map(transitions);

export function isLifecycleState(value: string): value is LifecycleState {
  return (
    value === LifecycleStates.Created ||
    value === LifecycleStates.Initializing ||
    value === LifecycleStates.Running ||
    value === LifecycleStates.Stopping ||
    value === LifecycleStates.Stopped ||
    value === LifecycleStates.Failed
  );
}

export function assertValidTransition(current: LifecycleState, next: LifecycleState): void {
  const allowed = VALID_LIFECYCLE_TRANSITIONS.get(current);

  if (allowed === undefined || !allowed.includes(next)) {
    throw new Error(
      `Invalid lifecycle transition from '${current}' to '${next}'.` +
        ` Allowed transitions from '${current}' are: ${allowed?.join(', ') ?? 'none'}.`
    );
  }
}
