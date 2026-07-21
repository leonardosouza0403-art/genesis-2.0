const semverPattern = /^\d+\.\d+\.\d+$/;

export class GenesisVersion {
  public readonly value: string;

  constructor(value: string) {
    const normalized = value.trim();

    if (!semverPattern.test(normalized)) {
      throw new Error('GenesisVersion must follow semantic versioning MAJOR.MINOR.PATCH');
    }

    this.value = normalized;
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: GenesisVersion): boolean {
    return other instanceof GenesisVersion && this.value === other.value;
  }

  public static create(value: string): GenesisVersion {
    return new GenesisVersion(value);
  }
}
