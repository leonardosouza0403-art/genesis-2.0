export const workspaceId = '@genesis/core' as const;
export const workspaceVersion = '2.0.0-alpha.2' as const;
export type CoreWorkspaceId = typeof workspaceId;

export { GenesisKernel } from './kernel/GenesisKernel.js';
export { ServiceRegistry } from './services/ServiceRegistry.js';
export { HealthService } from './health/HealthService.js';
export { EventBus } from './EventBus.js';
export { EventSubscription } from './EventSubscription.js';
export type { EventHandler } from './EventSubscription.js';
export { LifecycleManager } from './lifecycle/index.js';
export type { LifecycleState } from './lifecycle/LifecycleTransition.js';
export { LifecycleStates } from './lifecycle/LifecycleTransition.js';
export { ModuleLoader } from './modules/index.js';
export type { ModuleDescriptor } from './modules/ModuleDescriptor.js';
export type { ModuleDependency } from './modules/ModuleDependency.js';
export { createModuleDependency } from './modules/ModuleDependency.js';
export { createModuleDescriptor } from './modules/ModuleDescriptor.js';
