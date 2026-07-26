import * as FileSystem from "expo-file-system/legacy";
import type { FileSystemAdapter } from "@genesis/platform";

export class ExpoFileSystemAdapter implements FileSystemAdapter {
  public constructor(
    private readonly rootDirectory: string =
      `${FileSystem.documentDirectory ?? ""}genesis/`
  ) {}

  public async exists(path: string): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(this.resolve(path));
    return info.exists;
  }

  public async readText(path: string): Promise<string> {
    return FileSystem.readAsStringAsync(this.resolve(path));
  }

  public async writeText(path: string, content: string): Promise<void> {
    await this.ensureRootDirectory();

    await FileSystem.writeAsStringAsync(
      this.resolve(path),
      content
    );
  }

  private resolve(path: string): string {
    const normalized = path
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${this.rootDirectory}${normalized}`;
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