export class ProviderId {
  public readonly value: string;

  constructor(value: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new Error('ProviderId cannot be empty');
    }

    this.value = normalized;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ProviderId): boolean {
    return other instanceof ProviderId && this.value === other.value;
  }

  public static create(value: string): ProviderId {
    return new ProviderId(value);
  }
}
