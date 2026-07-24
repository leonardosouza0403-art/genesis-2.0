export type CapabilityCategory =
  | 'application'
  | 'device'
  | 'project'
  | 'camera'
  | 'microphone'
  | 'screen'
  | 'voice'
  | 'projector'
  | 'bluetooth'
  | 'health'
  | 'vehicle'
  | 'computer'
  | 'iot'
  | 'plugins'
  | 'network';

export interface CapabilityMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly string[];
  readonly supportedPlatforms: readonly string[];
  readonly categories: readonly CapabilityCategory[];
}

export abstract class Capability implements CapabilityMetadata {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly permissions: readonly string[];
  public abstract readonly supportedPlatforms: readonly string[];
  public abstract readonly categories: readonly CapabilityCategory[];

  public abstract isSupported(): Promise<boolean>;
  public abstract execute(params: Readonly<Record<string, unknown>>): Promise<unknown>;
}
