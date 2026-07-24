import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface GenesisMemoryObject {
  readonly [key: string]: GenesisMemoryValue;
}

export type GenesisMemoryValue = string | number | boolean | null | GenesisMemoryValue[] | GenesisMemoryObject;

export class GenesisMemory {
  private readonly store: Record<string, GenesisMemoryValue>;
  private constructor(private readonly filePath: string, store: Record<string, GenesisMemoryValue>) {
    this.store = store;
  }

  public static load(dataDirectory?: string): GenesisMemory {
    const directory = dataDirectory ?? resolvePackageDataDirectory();
    const filePath = join(directory, 'memory.json');
    const store = loadStore(filePath);
    return new GenesisMemory(filePath, store);
  }

  public get<T extends GenesisMemoryValue = GenesisMemoryValue>(key: string): T | undefined {
    return this.store[key] as T | undefined;
  }

  public set(key: string, value: GenesisMemoryValue): void {
    this.store[key] = deepClone(value);
    this.persist();
  }

  public delete(key: string): boolean {
    if (!(key in this.store)) {
      return false;
    }

    delete this.store[key];
    this.persist();
    return true;
  }

  public getAll(): Readonly<Record<string, GenesisMemoryValue>> {
    return deepFreeze({ ...this.store });
  }

  private persist(): void {
    const directory = dirname(this.filePath);

    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    const temporaryPath = `${this.filePath}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(this.store, null, 2), 'utf8');
    renameSync(temporaryPath, this.filePath);
  }
}

function loadStore(filePath: string): Record<string, GenesisMemoryValue> {
  if (!existsSync(filePath)) {
    return {};
  }

  const raw = readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!isPlainObject(parsed)) {
    throw new Error(`Memory file at '${filePath}' must contain a JSON object.`);
  }

  return validateRecord(parsed);
}

function validateRecord(value: Record<string, unknown>): Record<string, GenesisMemoryValue> {
  const store: Record<string, GenesisMemoryValue> = {};

  for (const [key, item] of Object.entries(value)) {
    store[key] = validateValue(item);
  }

  return store;
}

function validateValue(value: unknown): GenesisMemoryValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => validateValue(item))) as GenesisMemoryValue[];
  }

  if (isPlainObject(value)) {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, validateValue(item)]),
      ) as Record<string, GenesisMemoryValue>,
    );
  }

  throw new Error(`Unsupported memory value type for key '${String(value)}'.`);
}

function deepFreeze<T extends GenesisMemoryValue>(value: T): T {
  if (isPlainObject(value)) {
    const normalized = value as Record<string, GenesisMemoryValue>;
    for (const child of Object.values(normalized)) {
      deepFreeze(child);
    }

    return Object.freeze(normalized) as T;
  }

  if (Array.isArray(value)) {
    const normalized = value as GenesisMemoryValue[];
    normalized.forEach(deepFreeze);
    return Object.freeze(normalized) as T;
  }

  return value;
}

function deepClone(value: GenesisMemoryValue): GenesisMemoryValue {
  if (Array.isArray(value)) {
    return value.map(deepClone) as GenesisMemoryValue[];
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepClone(item)]),
    ) as Record<string, GenesisMemoryValue>;
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolvePackageDataDirectory(): string {
  return join(resolvePackageRoot(), '.genesis');
}

function resolvePackageRoot(): string {
  const sourcePath = fileURLToPath(import.meta.url);
  return dirname(dirname(dirname(sourcePath)));
}
