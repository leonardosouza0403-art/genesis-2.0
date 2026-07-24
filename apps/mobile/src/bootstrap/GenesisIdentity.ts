import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GenesisId } from '@genesis/contracts';

interface GenesisIdentityState {
  readonly ownerId: string;
  readonly createdAt: string;
}

const IdentityFileName = 'identity.json';
const BackupIdentityFileName = 'identity-backup.json';

export class GenesisIdentity {
  public readonly ownerId: GenesisId;
  public readonly createdAt: Date;

  private constructor(ownerId: GenesisId, createdAt: Date) {
    this.ownerId = ownerId;
    this.createdAt = createdAt;
  }

  public static load(options: GenesisIdentityOptions = {}): GenesisIdentity {
    const dataDirectory = options.dataDirectory ?? resolvePackageDataDirectory();
    const backupDirectory = options.backupDirectory ?? resolveBackupDirectory();
    const primaryPath = join(dataDirectory, IdentityFileName);
    const backupPath = join(backupDirectory, BackupIdentityFileName);

    const primary = loadIdentity(primaryPath);
    const backup = loadIdentity(backupPath);

    if (primary) {
      if (!backup) {
        saveIdentity(primary, backupPath);
      }
      return primary;
    }

    if (backup) {
      saveIdentity(backup, primaryPath);
      return backup;
    }

    const identity = GenesisIdentity.createNew();
    saveIdentity(identity, primaryPath);
    saveIdentity(identity, backupPath);
    return identity;
  }

  public toJSON(): GenesisIdentityState {
    return {
      ownerId: this.ownerId.toString(),
      createdAt: this.createdAt.toISOString(),
    };
  }

  public static createNew(): GenesisIdentity {
    const ownerId = GenesisId.create(generateUuid());
    return new GenesisIdentity(ownerId, new Date());
  }

  public static createFrom(ownerId: GenesisId, createdAt: Date): GenesisIdentity {
    return new GenesisIdentity(ownerId, createdAt);
  }
}

export interface GenesisIdentityOptions {
  readonly dataDirectory?: string;
  readonly backupDirectory?: string | undefined;
}

function createNewIdentity(): GenesisIdentity {
  return GenesisIdentity.createNew();
}

function loadIdentity(filePath: string): GenesisIdentity | undefined {
  if (!existsSync(filePath)) {
    return undefined;
  }

  try {
    const raw = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;

    if (!isPlainObject(parsed) || typeof parsed.ownerId !== 'string' || typeof parsed.createdAt !== 'string') {
      return undefined;
    }

    const ownerId = GenesisId.create(parsed.ownerId);
    const createdAt = new Date(parsed.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return undefined;
    }

    return GenesisIdentity.createFrom(ownerId, createdAt);
  } catch {
    return undefined;
  }
}

function saveIdentity(identity: GenesisIdentity, filePath: string): void {
  const directory = dirname(filePath);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  writeFileSync(filePath, JSON.stringify(identity.toJSON(), null, 2), 'utf8');
}

function resolvePackageDataDirectory(): string {
  return join(resolvePackageRoot(), '.genesis');
}

function resolveBackupDirectory(): string {
  const customBackupPath = process.env.GENESIS_IDENTITY_BACKUP_PATH;
  if (customBackupPath) {
    return customBackupPath;
  }

  const home = process.env.HOME ?? process.env.USERPROFILE;
  if (typeof home === 'string' && home.trim().length > 0) {
    return join(home, '.genesis', 'backup');
  }

  return join(resolvePackageRoot(), '.genesis', 'backup');
}

function resolvePackageRoot(): string {
  const sourcePath = fileURLToPath(import.meta.url);
  return dirname(dirname(dirname(sourcePath)));
}

function generateUuid(): string {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : randomUUID();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
