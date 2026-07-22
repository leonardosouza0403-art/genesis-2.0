import type { ConfigurationMap, ConfigurationValue } from './ConfigurationSchema.js';
import {
  ConfigurationSource,
  ConfigurationSourceType,
  RuntimeConfigurationSource,
} from './ConfigurationSource.js';

export class ConfigurationManager {
  private readonly sources: ConfigurationSource[] = [];
  private readonly runtimeSource = new RuntimeConfigurationSource();

  constructor(sourceCollection: ReadonlyArray<ConfigurationSource> = []) {
    this.sources.push(this.runtimeSource, ...sourceCollection);
  }

  public addSource(source: ConfigurationSource): void {
    this.sources.push(source);
  }

  public get<T extends ConfigurationValue = ConfigurationValue>(key: string): T | undefined {
    const value = this.findValue(key);
    return value === undefined ? undefined : deepFreeze(value) as T;
  }

  public getAll(): Readonly<Record<string, ConfigurationValue>> {
    const merged: Record<string, ConfigurationValue> = Object.create(null);

    for (const source of this.getSourcesByPriority('ascending')) {
      for (const [key, value] of source.getAll()) {
        merged[key] = value;
      }
    }

    return deepFreeze(merged);
  }

  public has(key: string): boolean {
    return this.findValue(key) !== undefined;
  }

  public set(key: string, value: ConfigurationValue): void {
    this.runtimeSource.set(key, value);
  }

  public remove(key: string): boolean {
    return this.runtimeSource.remove(key);
  }

  public clear(): void {
    this.runtimeSource.clear();
  }

  private findValue(key: string): ConfigurationValue | undefined {
    for (const source of this.getSourcesByPriority('descending')) {
      if (source.has(key)) {
        return source.get(key);
      }
    }

    return undefined;
  }

  private getSourcesByPriority(order: 'ascending' | 'descending'): ConfigurationSource[] {
    const sources = [...this.sources];

    sources.sort((left, right) => {
      if (left.priority !== right.priority) {
        return order === 'ascending' ? left.priority - right.priority : right.priority - left.priority;
      }

      return left.order[1] - right.order[1];
    });

    return sources;
  }
}

function deepFreeze<T extends ConfigurationValue>(value: T): T {
  if (isObject(value)) {
    if (Array.isArray(value)) {
      const normalized = value as ReadonlyArray<ConfigurationValue>;

      normalized.forEach((item) => {
        if (isObject(item)) {
          deepFreeze(item);
        }
      });

      return Object.freeze(normalized) as T;
    }

    const record = value as ConfigurationMap;

    for (const child of Object.values(record)) {
      if (isObject(child)) {
        deepFreeze(child);
      }
    }

    return Object.freeze(record) as T;
  }

  return value;
}

function isObject(value: unknown): value is ConfigurationMap {
  return typeof value === 'object' && value !== null;
}
