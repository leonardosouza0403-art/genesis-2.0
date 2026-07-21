export const workspaceId = '@genesis/contracts' as const;
export const workspaceVersion = '2.0.0-alpha.2' as const;
export type ContractsWorkspaceId = typeof workspaceId;

export * from './foundation/GenesisId.js';
export * from './foundation/GenesisVersion.js';
export * from './foundation/ModuleId.js';
export * from './foundation/ServiceId.js';
export * from './foundation/ProviderId.js';
export * from './foundation/CapabilityId.js';
export * from './foundation/ModuleState.js';
export * from './foundation/HealthStatus.js';
export * from './kernel/IKernel.js';
export * from './kernel/IService.js';
export * from './events/IEvent.js';
