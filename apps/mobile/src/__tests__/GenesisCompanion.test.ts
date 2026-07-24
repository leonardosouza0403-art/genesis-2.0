import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { GenesisBoot } from '../bootstrap/GenesisBoot.js';
import { GenesisCompanion } from '../bootstrap/GenesisCompanion.js';
import { GenesisSession } from '../bootstrap/GenesisSession.js';
import { GenesisMemory } from '../bootstrap/GenesisMemory.js';

function createTempDirectory(): string {
  return mkdtempSync(join(tmpdir(), 'genesis-alpha-'));
}

function cleanup(directory: string): void {
  rmSync(directory, { recursive: true, force: true });
}

test('GenesisSession.create() returns a valid session', async () => {
  const session = GenesisSession.create('owner-123', {
    date: '2026-07-23',
    lastLoadedAt: new Date().toISOString(),
    bootCount: 1,
    overview: 'Daily context initialized',
  });

  assert.strictEqual(typeof session.sessionId, 'string');
  assert.strictEqual(session.ownerId, 'owner-123');
  assert.ok(session.createdAt instanceof Date);
  assert.ok(session.startedAt instanceof Date);
  assert.strictEqual(session.dailyContext.date, '2026-07-23');
});

test('GenesisMemory persists values across reloads', async () => {
  const tempDirectory = createTempDirectory();

  try {
    const memory = GenesisMemory.load(tempDirectory);
    memory.set('key', 'value');

    const reloadedMemory = GenesisMemory.load(tempDirectory);
    assert.strictEqual(reloadedMemory.get('key'), 'value');
  } finally {
    cleanup(tempDirectory);
  }
});

test('GenesisBoot loads configuration, identity, memory, and capabilities', async () => {
  const tempDirectory = createTempDirectory();

  try {
    process.env.TEST_CONFIG_VALUE = 'true';

    const boot = await GenesisBoot.execute({
      dataDirectory: tempDirectory,
      configFilePath: join(tempDirectory, 'configuration.json'),
      identityBackupDirectory: join(tempDirectory, 'backup'),
    });

    assert.strictEqual(boot.identity.ownerId.toString().length > 0, true);
    assert.strictEqual(boot.dailyContext.bootCount, 1);
    assert.strictEqual(typeof boot.companionVersion, 'string');
    assert.strictEqual(boot.capabilities.length > 0, true);
    assert.strictEqual(boot.configurationManager.get('TEST_CONFIG_VALUE'), 'true');

    const currentSession = boot.memory.get('genesis.currentSession');
    assert.ok(currentSession !== undefined && typeof currentSession === 'object');
    assert.ok('sessionId' in (currentSession as Record<string, unknown>));
    assert.strictEqual(typeof (currentSession as Record<string, unknown>).sessionId, 'string');
    assert.strictEqual(((currentSession as Record<string, unknown>).sessionId as string).length > 0, true);
    assert.ok(Object.keys(boot.memory.getAll()).some((key) => key.startsWith('genesis.dailyContext.')));
  } finally {
    delete process.env.TEST_CONFIG_VALUE;
    cleanup(tempDirectory);
  }
});

test('GenesisCompanion.initialize() boots ready companion and discovers capabilities', async () => {
  const tempDirectory = createTempDirectory();

  try {
    const companion = await GenesisCompanion.initialize({
      dataDirectory: tempDirectory,
      configFilePath: join(tempDirectory, 'configuration.json'),
      identityBackupDirectory: join(tempDirectory, 'backup'),
    });

    assert.strictEqual(companion.isReady(), true);
    assert.strictEqual(companion.sessionId().length > 0, true);
    assert.strictEqual(companion.ownerId().length > 0, true);
    assert.strictEqual(companion.version().length > 0, true);
    assert.ok(companion.uptime() >= 0);

    const memory = companion.getMemory();
    const storedSession = memory.get('genesis.currentSession');
    assert.ok(storedSession !== undefined);

    const capabilities = companion.getRuntime().listCapabilities();
    assert.strictEqual(capabilities.length > 0, true);
    assert.ok(capabilities.some((capability) => capability.id === 'project-status'));
  } finally {
    cleanup(tempDirectory);
  }
});
