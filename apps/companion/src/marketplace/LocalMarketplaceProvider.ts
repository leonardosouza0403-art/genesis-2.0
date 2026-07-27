import type {
  PluginDescriptor,
  PluginMarketplaceProvider
} from "@genesis/mobile/marketplace";

import type {
  StorageAdapter
} from "@genesis/platform";

const InstalledPluginsKey =
  "genesis.marketplace.installed";

const catalog: readonly Omit<
  PluginDescriptor,
  "installed"
>[] = [
  {
    id: "genesis-audit-agent",
    name: "Genesis Audit Agent",
    version: "1.0.0",
    author: "GENESIS",
    description:
      "Executa auditorias controladas de integridade e configuração.",
    permissions: [
      "system.read",
      "audit.execute"
    ]
  },
  {
    id: "genesis-documentation-agent",
    name: "Genesis Documentation Agent",
    version: "1.0.0",
    author: "GENESIS",
    description:
      "Organiza documentação, histórico e registros técnicos.",
    permissions: [
      "documents.read",
      "documents.write"
    ]
  },
  {
    id: "genesis-test-agent",
    name: "Genesis Test Agent",
    version: "1.0.0",
    author: "GENESIS",
    description:
      "Executa testes autorizados e registra resultados.",
    permissions: [
      "tests.read",
      "tests.execute"
    ]
  }
];

export class LocalMarketplaceProvider
  implements PluginMarketplaceProvider {
  public constructor(
    private readonly storage: StorageAdapter
  ) {}

  public async list():
    Promise<readonly PluginDescriptor[]> {
    const installedIds =
      await this.loadInstalledPluginIds();

    return catalog.map((plugin) => ({
      ...plugin,
      installed: installedIds.includes(plugin.id)
    }));
  }

  public async install(
    pluginId: string
  ): Promise<void> {
    const normalizedId = normalizePluginId(pluginId);

    if (
      !catalog.some(
        (plugin) => plugin.id === normalizedId
      )
    ) {
      throw new Error(
        `Plugin '${normalizedId}' não existe no catálogo.`
      );
    }

    const installedIds =
      await this.loadInstalledPluginIds();

    if (installedIds.includes(normalizedId)) {
      return;
    }

    await this.saveInstalledPluginIds([
      ...installedIds,
      normalizedId
    ]);
  }

  public async uninstall(
    pluginId: string
  ): Promise<void> {
    const normalizedId = normalizePluginId(pluginId);
    const installedIds =
      await this.loadInstalledPluginIds();

    await this.saveInstalledPluginIds(
      installedIds.filter(
        (id) => id !== normalizedId
      )
    );
  }

  private async loadInstalledPluginIds():
    Promise<readonly string[]> {
    const raw =
      await this.storage.get(InstalledPluginsKey);

    if (raw === null) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (item) => typeof item === "string"
        )
      ) {
        return parsed;
      }
    } catch {
      await this.storage.remove(
        InstalledPluginsKey
      );
    }

    return [];
  }

  private saveInstalledPluginIds(
    pluginIds: readonly string[]
  ): Promise<void> {
    return this.storage.set(
      InstalledPluginsKey,
      JSON.stringify(pluginIds)
    );
  }
}

function normalizePluginId(
  pluginId: string
): string {
  const normalized = pluginId.trim();

  if (normalized.length === 0) {
    throw new Error(
      "Plugin identifier cannot be empty."
    );
  }

  return normalized;
}