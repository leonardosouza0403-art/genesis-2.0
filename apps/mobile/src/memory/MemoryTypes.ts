export type MemoryPrimitive =
  | string
  | number
  | boolean
  | null;

export interface MemoryObject {
  readonly [key: string]: MemoryValue;
}

export interface MemoryArray
  extends ReadonlyArray<MemoryValue> {}

export type MemoryValue =
  | MemoryPrimitive
  | MemoryArray
  | MemoryObject;

export interface MemoryEntry {
  readonly key: string;
  readonly value: MemoryValue;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MemorySnapshot {
  readonly count: number;
  readonly entries: readonly MemoryEntry[];
}