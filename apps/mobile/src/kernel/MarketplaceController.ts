import {
  PluginMarketplace,
  type PluginDescriptor,
  type PluginMarketplaceProvider
} from "../marketplace/index.js";

export interface MarketplaceSnapshot {
  readonly plugins: readonly PluginDescriptor[];
  readonly installed: readonly PluginDescriptor[];
  readonly available: readonly PluginDescriptor[];
}

export class MarketplaceController {
  private readonly marketplace: PluginMarketplace;

  public constructor(
    provider: PluginMarketplaceProvider
  ) {
    this.marketplace = new PluginMarketplace(provider);
  }

  public async snapshot(): Promise<MarketplaceSnapshot> {
    const plugins = await this.marketplace.list();

    return {
      plugins,
      installed: plugins.filter(
        (plugin) => plugin.installed
      ),
      available: plugins.filter(
        (plugin) => !plugin.installed
      )
    };
  }

  public async install(
    pluginId: string,
    authorized = false
  ): Promise<MarketplaceSnapshot> {
    if (!authorized) {
      throw new Error(
        "Plugin installation requires explicit authorization."
      );
    }

    await this.marketplace.install(
      normalizePluginId(pluginId)
    );

    return this.snapshot();
  }

  public async uninstall(
    pluginId: string,
    authorized = false
  ): Promise<MarketplaceSnapshot> {
    if (!authorized) {
      throw new Error(
        "Plugin removal requires explicit authorization."
      );
    }

    await this.marketplace.uninstall(
      normalizePluginId(pluginId)
    );

    return this.snapshot();
  }
}

function normalizePluginId(pluginId: string): string {
  const normalized = pluginId.trim();

  if (normalized.length === 0) {
    throw new Error(
      "Plugin identifier cannot be empty."
    );
  }

  return normalized;
}