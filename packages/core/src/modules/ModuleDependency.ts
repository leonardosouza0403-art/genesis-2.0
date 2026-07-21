import { ModuleId } from '@genesis/contracts';

export interface ModuleDependency {
  readonly moduleId: ModuleId;
  readonly required: boolean;
}

export function createModuleDependency(moduleId: ModuleId, required = true): ModuleDependency {
  return {
    moduleId,
    required
  };
}
