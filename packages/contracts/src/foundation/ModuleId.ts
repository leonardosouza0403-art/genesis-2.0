export class ModuleId {
  public readonly value: string;

  constructor(value: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new Error('ModuleId cannot be empty');
    }

    this.value = normalized;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ModuleId): boolean {
    return other instanceof ModuleId && this.value === other.value;
  }

  public static create(value: string): ModuleId {
    return new ModuleId(value);
  }
}
