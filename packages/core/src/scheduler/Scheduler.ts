import { SchedulerState } from './SchedulerState.js';
import { ScheduledTask } from './ScheduledTask.js';

export class Scheduler {
  private readonly tasks = new Map<string, ScheduledTask>();
  private state = SchedulerState.Created;

  public get schedulerState(): SchedulerState {
    return this.state;
  }

  public start(): void {
    if (this.state === SchedulerState.Running) {
      return;
    }

    this.state = SchedulerState.Running;
    this.scheduleAllTasks();
  }

  public stop(): void {
    if (this.state === SchedulerState.Stopped) {
      return;
    }

    this.state = SchedulerState.Stopped;
    this.clearAllTasks();
  }

  public registerTask(task: ScheduledTask): ScheduledTask {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with id '${task.id}' is already registered.`);
    }

    this.tasks.set(task.id, task);

    if (this.state === SchedulerState.Running && !task.isPaused && task.isActive) {
      this.scheduleTask(task);
    }

    return task;
  }

  public removeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (task === undefined) {
      return false;
    }

    task.clearTimer();
    task.pause();

    return this.tasks.delete(taskId);
  }

  public pauseTask(taskId: string): void {
    const task = this.requireTask(taskId);

    task.pause();
    task.clearTimer();

    if (this.state === SchedulerState.Running) {
      this.state = SchedulerState.Paused;
    }
  }

  public resumeTask(taskId: string): void {
    const task = this.requireTask(taskId);

    task.resume();

    if (this.state === SchedulerState.Paused) {
      this.state = SchedulerState.Running;
    }

    if (this.state === SchedulerState.Running && task.isActive) {
      this.scheduleTask(task);
    }
  }

  public async executeNow(taskId: string): Promise<void> {
    const task = this.requireTask(taskId);
    await task.executeNow();

    if (this.state === SchedulerState.Running && task.isActive && !task.isPaused) {
      this.scheduleTask(task);
    }
  }

  public listTasks(): readonly ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  private scheduleAllTasks(): void {
    for (const task of this.tasks.values()) {
      if (!task.isPaused && task.isActive) {
        this.scheduleTask(task);
      }
    }
  }

  private scheduleTask(task: ScheduledTask): void {
    if (!task.isActive || task.isPaused || this.state !== SchedulerState.Running) {
      return;
    }

    const delay = this.calculateDelay(task);

    if (delay === undefined) {
      return;
    }

    task.setTimer(
      setTimeout(async () => {
        await task.executeNow();

        if (task.isActive && !task.isPaused && task.intervalMs !== undefined) {
          this.scheduleTask(task);
        }
      }, delay),
    );
  }

  private calculateDelay(task: ScheduledTask): number | undefined {
    if (task.intervalMs !== undefined) {
      return task.intervalMs;
    }

    if (task.runAt !== undefined) {
      const delay = task.runAt.getTime() - Date.now();
      return delay <= 0 ? 0 : delay;
    }

    return undefined;
  }

  private clearAllTasks(): void {
    for (const task of this.tasks.values()) {
      task.clearTimer();
    }
  }

  private requireTask(taskId: string): ScheduledTask {
    const task = this.tasks.get(taskId);

    if (task === undefined) {
      throw new Error(`Task with id '${taskId}' is not registered.`);
    }

    return task;
  }
}
