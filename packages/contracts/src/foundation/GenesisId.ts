export class GenesisId {
  public readonly value: string;

  constructor(value: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new Error('GenesisId cannot be empty');
    }

    this.value = normalized;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: GenesisId): boolean {
    return other instanceof GenesisId && this.value === other.value;
  }

  public static create(value: string): GenesisId {
    return new GenesisId(value);
  }
}
