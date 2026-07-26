import type { StorageAdapter } from "@genesis/platform";

import type {
  MemoryEntry,
  MemorySnapshot,
  MemoryValue
} from "./MemoryTypes.js";

const MemoryIndexKey = "genesis.memory.index";
const MemoryPrefix = "genesis.memory.entry.";

export class MemoryKernel {
  public constructor(
    private readonly storage: StorageAdapter
  ) {}

  public async remember(
    key: string,
    value: MemoryValue
  ): Promise<MemoryEntry> {
    const normalizedKey = normalizeKey(key);
    const existing = await this.recall(normalizedKey);
    const now = new Date().toISOString();

    const entry: MemoryEntry = {
      key: normalizedKey,
      value,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    await this.storage.set(
      createStorageKey(normalizedKey),
      JSON.stringify(entry)
    );

    await this.addToIndex(normalizedKey);

    return entry;
  }

  public async recall(
    key: string
  ): Promise<MemoryEntry | null> {
    const normalizedKey = normalizeKey(key);
    const stored = await this.storage.get(
      createStorageKey(normalizedKey)
    );

    if (stored === null) {
      return null;
    }

    try {
      return JSON.parse(stored) as MemoryEntry;
    } catch {
      await this.forget(normalizedKey);
      return null;
    }
  }

  public async forget(key: string): Promise<boolean> {
    const normalizedKey = normalizeKey(key);
    const existing = await this.storage.get(
      createStorageKey(normalizedKey)
    );

    if (existing === null) {
      return false;
    }

    await this.storage.remove(
      createStorageKey(normalizedKey)
    );

    await this.removeFromIndex(normalizedKey);

    return true;
  }

  public async list(): Promise<readonly MemoryEntry[]> {
    const keys = await this.loadIndex();
    const entries = await Promise.all(
      keys.map((key) => this.recall(key))
    );

    return entries.filter(
      (entry): entry is MemoryEntry => entry !== null
    );
  }

  public async snapshot(): Promise<MemorySnapshot> {
    const entries = await this.list();

    return {
      count: entries.length,
      entries
    };
  }

  private async addToIndex(key: string): Promise<void> {
    const keys = await this.loadIndex();

    if (keys.includes(key)) {
      return;
    }

    await this.saveIndex([...keys, key]);
  }

  private async removeFromIndex(
    key: string
  ): Promise<void> {
    const keys = await this.loadIndex();

    await this.saveIndex(
      keys.filter((item) => item !== key)
    );
  }

  private async loadIndex(): Promise<readonly string[]> {
    const stored = await this.storage.get(MemoryIndexKey);

    if (stored === null) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        return parsed;
      }
    } catch {
      await this.storage.remove(MemoryIndexKey);
    }

    return [];
  }

  private async saveIndex(
    keys: readonly string[]
  ): Promise<void> {
    await this.storage.set(
      MemoryIndexKey,
      JSON.stringify(keys)
    );
  }
}

function normalizeKey(key: string): string {
  const normalized = key.trim();

  if (normalized.length === 0) {
    throw new Error("Memory key cannot be empty.");
  }

  return normalized;
}

function createStorageKey(key: string): string {
  return `${MemoryPrefix}${key}`;
}