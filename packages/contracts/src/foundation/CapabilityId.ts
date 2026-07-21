export class CapabilityId {
  public readonly value: string;

  constructor(value: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new Error('CapabilityId cannot be empty');
    }

    this.value = normalized;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: CapabilityId): boolean {
    return other instanceof CapabilityId && this.value === other.value;
  }

  public static create(value: string): CapabilityId {
    return new CapabilityId(value);
  }
}
