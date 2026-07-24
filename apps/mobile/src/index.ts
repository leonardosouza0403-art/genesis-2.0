export const workspaceId = '@genesis/mobile' as const;
export const workspaceVersion = '2.0.0-alpha.2' as const;
export type MobileWorkspaceId = typeof workspaceId;

export { MobileRuntime } from './runtime/index.js';
export { GenesisBoot } from './bootstrap/GenesisBoot.js';
export { GenesisCompanion } from './bootstrap/GenesisCompanion.js';
export type { CapabilityExecutionResult } from './runtime/index.js';
