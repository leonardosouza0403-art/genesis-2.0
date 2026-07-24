import { GenesisBoot, type GenesisBootOptions } from './GenesisBoot.js';
import type { GenesisIdentity } from './GenesisIdentity.js';
import type { GenesisMemory } from './GenesisMemory.js';
import type { GenesisSession } from './GenesisSession.js';
import type { MobileRuntime } from '../runtime/index.js';

export class GenesisCompanion {
  private readonly bootTimestamp: Date;
  private readonly identity: GenesisIdentity;
  private readonly memory: GenesisMemory;
  private readonly session: GenesisSession;
  private readonly runtime: MobileRuntime;
  private readonly companionVersion: string;
  private readonly ready: boolean;

  private constructor(boot: GenesisBoot) {
    this.bootTimestamp = boot.bootTime;
    this.identity = boot.identity;
    this.memory = boot.memory;
    this.session = boot.session;
    this.runtime = boot.runtime;
    this.companionVersion = boot.companionVersion;
    this.ready = true;
  }

  public static async initialize(options: GenesisBootOptions = {}): Promise<GenesisCompanion> {
    const boot = await GenesisBoot.execute(options);
    return new GenesisCompanion(boot);
  }

  public isReady(): boolean {
    return this.ready;
  }

  public bootTime(): Date {
    return new Date(this.bootTimestamp.getTime());
  }

  public sessionId(): string {
    return this.session.sessionId;
  }

  public ownerId(): string {
    return this.identity.ownerId.toString();
  }

  public version(): string {
    return this.companionVersion;
  }

  public uptime(): number {
    return Date.now() - this.bootTimestamp.getTime();
  }

  public getMemory(): GenesisMemory {
    return this.memory;
  }

  public getRuntime(): MobileRuntime {
    return this.runtime;
  }
}
