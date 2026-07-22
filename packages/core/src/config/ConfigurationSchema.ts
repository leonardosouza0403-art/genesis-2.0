export type JsonPrimitive = string | number | boolean | null;

export interface ConfigurationArray extends ReadonlyArray<ConfigurationValue> {}

export interface ConfigurationObject {
  readonly [key: string]: ConfigurationValue;
}

export type ConfigurationValue = JsonPrimitive | ConfigurationArray | ConfigurationObject;

export type ConfigurationMap = Readonly<Record<string, ConfigurationValue>>;

export class ConfigurationSchema<T extends ConfigurationMap = ConfigurationMap> {
  private readonly allowedKeys: ReadonlySet<string>;

  constructor(keys: ReadonlyArray<keyof T>) {
    this.allowedKeys = new Set(keys.map((key) => String(key)));
  }

  public has(key: string): boolean {
    return this.allowedKeys.has(key);
  }

  public assertValidKey(key: string): void {
    if (!this.has(key)) {
      throw new Error(`Configuration schema does not allow key '${key}'.`);
    }
  }

  public getKeys(): ReadonlyArray<keyof T> {
    return [...this.allowedKeys] as ReadonlyArray<keyof T>;
  }
}
