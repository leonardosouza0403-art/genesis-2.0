export interface WakeWordProvider {
  start(onDetected: () => void): Promise<void>;
  stop(): Promise<void>;
  release(): Promise<void>;
  isRunning(): boolean;
}