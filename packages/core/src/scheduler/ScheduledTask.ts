export type TaskAction = () => Promise<void> | void;

export class ScheduledTask {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private paused = false;
  private active = true;

  public readonly oneShot: boolean;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly action: TaskAction,
    public readonly intervalMs?: number,
    public readonly runAt?: Date,
  ) {
    this.oneShot = intervalMs === undefined && runAt !== undefined;
  }

  public get isPaused(): boolean {
    return this.paused;
  }

  public get isActive(): boolean {
    return this.active;
  }

  public pause(): void {
    this.paused = true;
    this.clearTimer();
  }

  public resume(): void {
    this.paused = false;
  }

  public async executeNow(): Promise<void> {
    if (!this.active) {
      return;
    }

    await Promise.resolve(this.action());

    if (this.oneShot) {
      this.active = false;
      this.clearTimer();
    }
  }

  public clearTimer(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  public setTimer(timer: ReturnType<typeof setTimeout>): void {
    this.clearTimer();
    this.timer = timer;
  }
}