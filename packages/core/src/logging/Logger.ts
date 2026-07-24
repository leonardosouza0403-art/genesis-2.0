import type { LogEntry } from './LogEntry.js';
import { LogLevel } from './LogLevel.js';

export interface Logger {
  log(level: LogLevel, category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void;
  trace(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void;
  debug(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void;
  info(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void;
  warn(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void;
  error(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void;
  fatal(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void;
}
