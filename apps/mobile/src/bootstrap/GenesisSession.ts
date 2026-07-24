import { randomUUID } from 'node:crypto';
import type { GenesisMemoryValue } from './GenesisMemory.js';

export interface GenesisDailyContext extends Record<string, GenesisMemoryValue> {
  readonly date: string;
  readonly lastLoadedAt: string;
  readonly bootCount: number;
  readonly overview: string;
}

export interface GenesisSessionState extends Record<string, GenesisMemoryValue> {
  readonly sessionId: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly startedAt: string;
  readonly dailyContext: GenesisDailyContext;
}

export class GenesisSession {
  public readonly sessionId: string;
  public readonly ownerId: string;
  public readonly createdAt: Date;
  public readonly startedAt: Date;
  public readonly dailyContext: GenesisDailyContext;

  private constructor(
    sessionId: string,
    ownerId: string,
    createdAt: Date,
    startedAt: Date,
    dailyContext: GenesisDailyContext,
  ) {
    this.sessionId = sessionId;
    this.ownerId = ownerId;
    this.createdAt = createdAt;
    this.startedAt = startedAt;
    this.dailyContext = dailyContext;
  }

  public static create(ownerId: string, dailyContext: GenesisDailyContext): GenesisSession {
    return new GenesisSession(generateUuid(), ownerId, new Date(), new Date(), dailyContext);
  }

  public toJSON(): GenesisSessionState {
    return {
      sessionId: this.sessionId,
      ownerId: this.ownerId,
      createdAt: this.createdAt.toISOString(),
      startedAt: this.startedAt.toISOString(),
      dailyContext: this.dailyContext,
    };
  }
}

function generateUuid(): string {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : randomUUID();
}
