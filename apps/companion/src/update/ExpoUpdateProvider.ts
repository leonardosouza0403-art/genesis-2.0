import Constants from "expo-constants";
import * as Updates from "expo-updates";

import type {
  UpdateInfo,
  UpdateProvider
} from "@genesis/mobile/update";

export class ExpoUpdateProvider implements UpdateProvider {
  public async check(): Promise<UpdateInfo> {
    const currentVersion =
      Constants.expoConfig?.version ?? "unknown";

    if (!Updates.isEnabled) {
      return {
        currentVersion,
        latestVersion: currentVersion,
        hasUpdate: false,
        releaseNotes:
          "Atualizações remotas indisponíveis neste ambiente.",
        publishedAt:
          Updates.createdAt?.toISOString() ??
          new Date().toISOString()
      };
    }

    const result = await Updates.checkForUpdateAsync();

    return {
      currentVersion,
      latestVersion: result.isAvailable
        ? "remote-update"
        : currentVersion,
      hasUpdate: result.isAvailable,
      releaseNotes: result.isAvailable
        ? "Nova atualização remota disponível."
        : "O GENESIS já está atualizado.",
      publishedAt: new Date().toISOString()
    };
  }

  public async download(
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (!Updates.isEnabled) {
      throw new Error(
        "Expo Updates não está habilitado neste ambiente."
      );
    }

    onProgress?.(0);

    const result = await Updates.fetchUpdateAsync();

    if (!result.isNew) {
      throw new Error(
        "Nenhuma nova atualização foi baixada."
      );
    }

    onProgress?.(100);
  }

  public async install(): Promise<void> {
    if (!Updates.isEnabled) {
      throw new Error(
        "Expo Updates não está habilitado neste ambiente."
      );
    }

    await Updates.reloadAsync();
  }
}