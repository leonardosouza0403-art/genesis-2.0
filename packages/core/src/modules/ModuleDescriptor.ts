import { ModuleId } from '@genesis/contracts';
import type { ModuleDependency } from './ModuleDependency.js';

export interface ModuleDescriptor {
  readonly id: ModuleId;
  readonly dependencies: readonly ModuleDependency[];
}

export function createModuleDescriptor(id: ModuleId, dependencies: readonly ModuleDependency[] = []): ModuleDescriptor {
  return {
    id,
    dependencies
  };
}
