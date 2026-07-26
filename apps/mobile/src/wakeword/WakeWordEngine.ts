import type { WakeWordProvider } from "./WakeWordTypes.js";

export class WakeWordEngine {
  public constructor(
    private readonly provider: WakeWordProvider
  ) {}

  public start(onDetected: () => void): Promise<void> {
    return this.provider.start(onDetected);
  }

  public stop(): Promise<void> {
    return this.provider.stop();
  }

  public release(): Promise<void> {
    return this.provider.release();
  }

  public isRunning(): boolean {
    return this.provider.isRunning();
  }
}