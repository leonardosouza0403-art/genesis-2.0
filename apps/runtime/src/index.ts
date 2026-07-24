export const workspaceId = '@genesis/runtime' as const;
export const workspaceVersion = '2.0.0-alpha.2' as const;
export type RuntimeWorkspaceId = typeof workspaceId;

export { GenesisRuntime } from './runtime/index.js';
export { RuntimeState } from './runtime/RuntimeState.js';
export type { RuntimeContext } from './runtime/RuntimeContext.js';
