import type { Logger } from './Logger.js';
import type { LogEntry } from './LogEntry.js';
import { LogLevel } from './LogLevel.js';

export class ConsoleLogger implements Logger {
  public log(level: LogLevel, category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      category,
      level,
      message,
      metadata: metadata === undefined ? undefined : Object.freeze({ ...metadata }),
    };

    this.write(entry);
  }

  public trace(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void {
    this.log(LogLevel.Trace, category, message, metadata);
  }

  public debug(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void {
    this.log(LogLevel.Debug, category, message, metadata);
  }

  public info(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void {
    this.log(LogLevel.Info, category, message, metadata);
  }

  public warn(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void {
    this.log(LogLevel.Warn, category, message, metadata);
  }

  public error(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void {
    this.log(LogLevel.Error, category, message, metadata);
  }

  public fatal(category: string, message: string, metadata?: Readonly<Record<string, unknown>>): void {
    this.log(LogLevel.Fatal, category, message, metadata);
  }

  private write(entry: LogEntry): void {
    const formatted = this.format(entry);

    if (entry.level === LogLevel.Error || entry.level === LogLevel.Fatal) {
      console.error(formatted);
      return;
    }

    console.log(formatted);
  }

  private format(entry: LogEntry): string {
    const metadataText = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';

    return `[${entry.timestamp.toISOString()}] [${entry.level}] [${entry.category}] ${entry.message}${metadataText}`;
  }
}
