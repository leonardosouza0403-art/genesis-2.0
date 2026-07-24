import { LogLevel } from './LogLevel.js';

export interface LogEntry {
  readonly timestamp: Date;
  readonly category: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, unknown>> | undefined;
}
