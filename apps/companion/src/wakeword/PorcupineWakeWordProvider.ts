import {
  BuiltInKeywords,
  PorcupineManager
} from "@picovoice/porcupine-react-native";

import type {
  WakeWordProvider
} from "@genesis/mobile/wakeword";

export class PorcupineWakeWordProvider
  implements WakeWordProvider {
  private manager: PorcupineManager | null = null;
  private running = false;

  public constructor(
    private readonly accessKey: string
  ) {}

  public async start(
    onDetected: () => void
  ): Promise<void> {
    if (this.running) {
      return;
    }

    const normalizedAccessKey = this.accessKey.trim();

    if (normalizedAccessKey.length === 0) {
      throw new Error(
        "EXPO_PUBLIC_PICOVOICE_ACCESS_KEY não foi configurada."
      );
    }

    if (this.manager === null) {
      this.manager =
        await PorcupineManager.fromBuiltInKeywords(
          normalizedAccessKey,
          [BuiltInKeywords.JARVIS],
          () => {
            onDetected();
          }
        );
    }

    await this.manager.start();
    this.running = true;
  }

  public async stop(): Promise<void> {
    if (!this.running || this.manager === null) {
      return;
    }

    await this.manager.stop();
    this.running = false;
  }

  public async release(): Promise<void> {
    await this.stop();

    if (this.manager !== null) {
      await Promise.resolve(this.manager.delete());
      this.manager = null;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }
}