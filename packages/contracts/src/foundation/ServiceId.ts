export class ServiceId {
  public readonly value: string;

  constructor(value: string) {
    const normalized = value.trim();

    if (!normalized) {
      throw new Error('ServiceId cannot be empty');
    }

    this.value = normalized;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: ServiceId): boolean {
    return other instanceof ServiceId && this.value === other.value;
  }

  public static create(value: string): ServiceId {
    return new ServiceId(value);
  }
}
