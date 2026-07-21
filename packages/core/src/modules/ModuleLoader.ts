import { ModuleId } from '@genesis/contracts';
import type { ModuleDescriptor } from './ModuleDescriptor.js';
import type { ModuleDependency } from './ModuleDependency.js';

export class ModuleLoader {
  private readonly descriptors = new Map<string, ModuleDescriptor>();

  public register(descriptor: ModuleDescriptor): void {
    const key = descriptor.id.toString();

    if (this.descriptors.has(key)) {
      throw new Error(`Module '${key}' is already registered.`);
    }

    if (descriptor.dependencies.some((dependency) => dependency.moduleId.equals(descriptor.id))) {
      throw new Error(`Module '${key}' cannot depend on itself.`);
    }

    this.descriptors.set(key, descriptor);
  }

  public remove(moduleId: ModuleId): boolean {
    return this.descriptors.delete(moduleId.toString());
  }

  public get(moduleId: ModuleId): ModuleDescriptor | undefined {
    return this.descriptors.get(moduleId.toString());
  }

  public resolveInitializationOrder(): readonly ModuleDescriptor[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const ordered: ModuleDescriptor[] = [];

    for (const descriptor of this.descriptors.values()) {
      this.visit(descriptor, visited, visiting, ordered);
    }

    return ordered;
  }

  private visit(
    descriptor: ModuleDescriptor,
    visited: Set<string>,
    visiting: Set<string>,
    ordered: ModuleDescriptor[]
  ): void {
    const key = descriptor.id.toString();

    if (visited.has(key)) {
      return;
    }

    if (visiting.has(key)) {
      throw new Error(`Circular dependency detected at module '${key}'.`);
    }

    visiting.add(key);

    for (const dependency of descriptor.dependencies) {
      const dependencyKey = dependency.moduleId.toString();
      const dependencyDescriptor = this.descriptors.get(dependencyKey);

      if (dependencyDescriptor === undefined) {
        if (dependency.required) {
          throw new Error(`Required dependency '${dependencyKey}' for module '${key}' is not registered.`);
        }

        continue;
      }

      this.visit(dependencyDescriptor, visited, visiting, ordered);
    }

    visiting.delete(key);
    visited.add(key);
    ordered.push(descriptor);
  }
}
