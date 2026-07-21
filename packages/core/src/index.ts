export const workspaceId = '@genesis/core' as const;
export const workspaceVersion = '2.0.0-alpha.2' as const;
export type CoreWorkspaceId = typeof workspaceId;

export { GenesisKernel } from './kernel/GenesisKernel.js';
export { ServiceRegistry } from './services/ServiceRegistry.js';
export { HealthService } from './health/HealthService.js';
