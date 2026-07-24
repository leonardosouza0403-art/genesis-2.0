import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { CapabilityRegistry } from './CapabilityRegistry.js';
import { setActiveCapabilityRegistry } from './CapabilityRegistrar.js';

const ignoredFiles = new Set([
  'Capability.ts',
  'CapabilityRegistry.ts',
  'CapabilityExecutor.ts',
  'CapabilityRegistrar.ts',
  'CapabilityBootstrap.ts',
  'CapabilityMixin.ts',
  'index.ts',
]);

function isIgnoredCapabilityFile(fileName: string): boolean {
  if (fileName.endsWith('.d.ts') || fileName.endsWith('.js.map') || fileName.endsWith('.ts.map')) {
    return true;
  }

  const normalized = fileName.endsWith('.js') ? fileName.replace(/\.js$/, '.ts') : fileName;
  return ignoredFiles.has(normalized);
}

function isCapabilityModuleFile(fileName: string): boolean {
  if (fileName.endsWith('.js') && !fileName.endsWith('.js.map')) {
    return true;
  }

  if (fileName.endsWith('.ts') && !fileName.endsWith('.d.ts') && !fileName.endsWith('.ts.map')) {
    return true;
  }

  return false;
}

export async function createCapabilityRegistry(): Promise<CapabilityRegistry> {
  const registry = new CapabilityRegistry();
  setActiveCapabilityRegistry(registry);

  const capabilitiesFolder = join(fileURLToPath(new URL('./', import.meta.url) as unknown as URL));
  const fileNames = readdirSync(capabilitiesFolder);

  for (const fileName of fileNames) {
    if (!isCapabilityModuleFile(fileName)) {
      continue;
    }

    if (isIgnoredCapabilityFile(fileName)) {
      continue;
    }

    await import(new URL(fileName, import.meta.url).href);
  }

  setActiveCapabilityRegistry(undefined);

  return registry;
}
