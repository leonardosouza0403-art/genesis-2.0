import { existsSync, readFileSync } from 'node:fs';
import type { ConfigurationMap, ConfigurationValue } from './ConfigurationSchema.js';

export enum ConfigurationSourceType {
  Default = 0,
  File = 10,
  Environment = 20,
  Runtime = 30,
}

export abstract class ConfigurationSource {
  private static sequenceCounter = 0;
  private readonly sequence = ConfigurationSource.getNextSequence();

  constructor(public readonly name: string, public readonly priority: ConfigurationSourceType) {}

  private static getNextSequence(): number {
    return ConfigurationSource.sequenceCounter++;
  }

  public get order(): readonly [ConfigurationSourceType, number] {
    return [this.priority, this.sequence] as const;
  }

  public abstract has(key: string): boolean;
  public abstract get<T extends ConfigurationValue>(key: string): T | undefined;
  public abstract getAll(): ReadonlyMap<string, ConfigurationValue>;
}

abstract class BaseMapConfigurationSource extends ConfigurationSource {
  protected constructor(
    name: string,
    priority: ConfigurationSourceType,
    protected readonly contents: ReadonlyMap<string, ConfigurationValue>,
  ) {
    super(name, priority);
  }

  public has(key: string): boolean {
    return this.contents.has(key);
  }

  public get<T extends ConfigurationValue>(key: string): T | undefined {
    return this.contents.get(key) as T | undefined;
  }

  public getAll(): ReadonlyMap<string, ConfigurationValue> {
    return this.contents;
  }
}

export class DefaultConfigurationSource extends BaseMapConfigurationSource {
  constructor(defaults: ConfigurationMap) {
    super('default', ConfigurationSourceType.Default, createSourceMap(defaults));
  }
}

export class FileConfigurationSource extends BaseMapConfigurationSource {
  constructor(filePath: string) {
    super('file', ConfigurationSourceType.File, createSourceMap(loadFileConfiguration(filePath)));
  }
}

export class EnvironmentConfigurationSource extends BaseMapConfigurationSource {
  constructor(environment?: Readonly<Record<string, string | undefined>>) {
    const source = environment ??
      ((globalThis as { process?: { env?: Readonly<Record<string, string | undefined>> } }).process?.env ?? {});

    const values = Object.fromEntries(
      Object.entries(source).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    ) as ConfigurationMap;
    super('environment', ConfigurationSourceType.Environment, createSourceMap(values));
  }
}

export class RuntimeConfigurationSource extends ConfigurationSource {
  private readonly contents = new Map<string, ConfigurationValue>();

  constructor() {
    super('runtime', ConfigurationSourceType.Runtime);
  }

  public has(key: string): boolean {
    return this.contents.has(key);
  }

  public get<T extends ConfigurationValue>(key: string): T | undefined {
    return this.contents.get(key) as T | undefined;
  }

  public getAll(): ReadonlyMap<string, ConfigurationValue> {
    return new Map(this.contents);
  }

  public set(key: string, value: ConfigurationValue): void {
    this.contents.set(key, value);
  }

  public remove(key: string): boolean {
    return this.contents.delete(key);
  }

  public clear(): void {
    this.contents.clear();
  }
}

function createSourceMap(source: ConfigurationMap): ReadonlyMap<string, ConfigurationValue> {
  return new Map(Object.entries(source));
}

function loadFileConfiguration(filePath: string): ConfigurationMap {
  if (!existsSync(filePath)) {
    return Object.freeze({} as ConfigurationMap);
  }

  const raw = readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!isPlainObject(parsed)) {
    throw new Error(`Configuration file at '${filePath}' must contain a JSON object.`);
  }

  return Object.freeze(
    Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, validateConfigurationValue(value)]),
    ) as ConfigurationMap,
  );
}

function validateConfigurationValue(value: unknown): ConfigurationValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return Object.freeze(value.map(validateConfigurationValue)) as ConfigurationValue;
  }

  if (isPlainObject(value)) {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, validateConfigurationValue(child)]),
      ) as ConfigurationMap,
    );
  }

  throw new Error(`Unsupported configuration value type for value '${String(value)}'.`);
}

// Compatibility note: using direct node:fs imports for ESM runtime and compiled dist environments.

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
