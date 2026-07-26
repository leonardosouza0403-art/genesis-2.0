import * as FileSystem from "expo-file-system/legacy";
import type { StorageAdapter } from "@genesis/platform";

export class ExpoStorageAdapter implements StorageAdapter {
  public constructor(
    private readonly rootDirectory: string =
      `${FileSystem.documentDirectory ?? ""}genesis/storage/`
  ) {}

  public async get(key: string): Promise<string | null> {
    const path = this.resolve(key);
    const info = await FileSystem.getInfoAsync(path);

    if (!info.exists) {
      return null;
    }

    return FileSystem.readAsStringAsync(path);
  }

  public async set(key: string, value: string): Promise<void> {
    await this.ensureRootDirectory();

    await FileSystem.writeAsStringAsync(
      this.resolve(key),
      value
    );
  }

  public async remove(key: string): Promise<void> {
    const path = this.resolve(key);
    const info = await FileSystem.getInfoAsync(path);

    if (info.exists) {
      await FileSystem.deleteAsync(path, {
        idempotent: true
      });
    }
  }

  private resolve(key: string): string {
    const fileName = encodeURIComponent(key);
    return `${this.rootDirectory}${fileName}.json`;
  }

  private async ensureRootDirectory(): Promise<void> {
    const info = await FileSystem.getInfoAsync(this.rootDirectory);

    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(
        this.rootDirectory,
        { intermediates: true }
      );
    }
  }
}