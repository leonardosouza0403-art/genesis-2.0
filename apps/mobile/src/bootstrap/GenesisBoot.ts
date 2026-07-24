import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { ConfigurationManager, DefaultConfigurationSource, EnvironmentConfigurationSource, FileConfigurationSource } from '@genesis/core';
import { GenesisIdentity } from './GenesisIdentity.js';
import { GenesisMemory } from './GenesisMemory.js';
import { GenesisSession, type GenesisDailyContext } from './GenesisSession.js';
import { MobileRuntime } from '../runtime/index.js';

export interface GenesisBootOptions {
  readonly dataDirectory?: string;
  readonly configFilePath?: string;
  readonly identityBackupDirectory?: string;
}

export class GenesisBoot {
  public readonly configurationManager: ConfigurationManager;
  public readonly identity: GenesisIdentity;
  public readonly memory: GenesisMemory;
  public readonly runtime: MobileRuntime;
  public readonly session: GenesisSession;
  public readonly dailyContext: GenesisDailyContext;
  public readonly capabilities: readonly unknown[];
  public readonly bootTime: Date;
  public readonly companionVersion: string;

  private constructor(
    configurationManager: ConfigurationManager,
    identity: GenesisIdentity,
    memory: GenesisMemory,
    runtime: MobileRuntime,
    session: GenesisSession,
    dailyContext: GenesisDailyContext,
    capabilities: readonly unknown[],
    bootTime: Date,
    companionVersion: string,
  ) {
    this.configurationManager = configurationManager;
    this.identity = identity;
    this.memory = memory;
    this.runtime = runtime;
    this.session = session;
    this.dailyContext = dailyContext;
    this.capabilities = capabilities;
    this.bootTime = bootTime;
    this.companionVersion = companionVersion;
  }

  public static async execute(options: GenesisBootOptions = {}): Promise<GenesisBoot> {
    const dataDirectory = options.dataDirectory ?? resolvePackageDataDirectory();
    const configFilePath = options.configFilePath ?? join(dataDirectory, 'configuration.json');
    const companionVersion = loadCompanionVersion();

    const configurationManager = new ConfigurationManager([
      new DefaultConfigurationSource({
        companionName: 'GENESIS Alpha Companion',
        companionVersion,
      }),
      new FileConfigurationSource(configFilePath),
      new EnvironmentConfigurationSource(),
    ]);

    const identity = GenesisIdentity.load({ dataDirectory, backupDirectory: options.identityBackupDirectory });
    const memory = GenesisMemory.load(dataDirectory);
    const runtime = await MobileRuntime.create();
    const capabilities = runtime.listCapabilities();
    const dailyContext = GenesisBoot.loadDailyContext(memory);
    const session = GenesisSession.create(identity.ownerId.toString(), dailyContext);

    memory.set('genesis.currentSession', session.toJSON() as unknown as Parameters<GenesisMemory['set']>[1]);

    return new GenesisBoot(
      configurationManager,
      identity,
      memory,
      runtime,
      session,
      dailyContext,
      capabilities,
      new Date(),
      companionVersion,
    );
  }

  private static loadDailyContext(memory: GenesisMemory): GenesisDailyContext {
    const date = new Date().toISOString().slice(0, 10);
    const key = `genesis.dailyContext.${date}`;
    const existing = memory.get(key) as GenesisDailyContext | undefined;
    const now = new Date().toISOString();

    if (existing) {
      const updated: GenesisDailyContext = {
        date: existing.date,
        lastLoadedAt: now,
        bootCount: existing.bootCount + 1,
        overview: existing.overview,
      };
      memory.set(key, updated as unknown as Parameters<GenesisMemory['set']>[1]);
      return updated;
    }

    const dailyContext: GenesisDailyContext = {
      date,
      lastLoadedAt: now,
      bootCount: 1,
      overview: `Daily context for ${date}`,
    };

    memory.set(key, dailyContext as unknown as Parameters<GenesisMemory['set']>[1]);
    return dailyContext;
  }
}

function loadCompanionVersion(): string {
  const packageJson = loadPackageManifest();
  return typeof packageJson.version === 'string' ? packageJson.version : 'unknown';
}

function loadPackageManifest(): { readonly version?: string } {
  const packageJsonPath = join(resolvePackageRoot(), 'package.json');
  const fileContents = readFileFromFileSystem(packageJsonPath);
  return JSON.parse(fileContents) as { version?: string };
}

function readFileFromFileSystem(path: string): string {
  return readFileSync(path, 'utf8');
}

function resolvePackageDataDirectory(): string {
  return join(resolvePackageRoot(), '.genesis');
}

function resolvePackageRoot(): string {
  const sourcePath = fileURLToPath(import.meta.url);
  return dirname(dirname(dirname(sourcePath)));
}
