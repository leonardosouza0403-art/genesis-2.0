import type { StorageAdapter } from "@genesis/platform";

import type {
  AgentExecutor,
  AgentSnapshot,
  AgentTask,
  AgentTaskRequest
} from "./AgentTypes.js";

const TasksKey = "genesis.agent.tasks";

export class AutonomousAgent {
  private running = false;

  public constructor(
    private readonly storage: StorageAdapter,
    private readonly executor: AgentExecutor
  ) {}

  public async createTask(
    request: AgentTaskRequest
  ): Promise<AgentTask> {
    const tasks = await this.listTasks();
    const now = new Date().toISOString();

    const task: AgentTask = {
      id: createIdentifier("task"),
      objective: normalizeText(request.objective),
      conversationId: normalizeText(request.conversationId),
      riskLevel: request.riskLevel ?? "low",
      requiresAuthorization:
        request.requiresAuthorization ?? false,
      status: "pending",
      result: null,
      error: null,
      createdAt: now,
      updatedAt: now
    };

    await this.saveTasks([...tasks, task]);

    return task;
  }

  public async executeTask(
    taskId: string,
    authorized = false
  ): Promise<AgentTask | null> {
    const tasks = await this.listTasks();
    const task = tasks.find((item) => item.id === taskId);

    if (task === undefined) {
      return null;
    }

    if (
      task.requiresAuthorization &&
      !authorized
    ) {
      throw new Error(
        "This task requires explicit authorization."
      );
    }

    const runningTask = updateTask(task, {
      status: "running",
      error: null,
      result: null
    });

    await this.replaceTask(tasks, runningTask);
    this.running = true;

    try {
      const result = await this.executor.execute(
        runningTask.conversationId,
        runningTask.objective
      );

      const completedTask = updateTask(runningTask, {
        status: "completed",
        result,
        error: null
      });

      await this.replaceTask(
        await this.listTasks(),
        completedTask
      );

      return completedTask;
    } catch (error) {
      const failedTask = updateTask(runningTask, {
        status: "failed",
        result: null,
        error:
          error instanceof Error
            ? error.message
            : String(error)
      });

      await this.replaceTask(
        await this.listTasks(),
        failedTask
      );

      return failedTask;
    } finally {
      this.running = false;
    }
  }

  public async cancelTask(
    taskId: string
  ): Promise<AgentTask | null> {
    const tasks = await this.listTasks();
    const task = tasks.find((item) => item.id === taskId);

    if (task === undefined) {
      return null;
    }

    if (
      task.status === "completed" ||
      task.status === "failed"
    ) {
      return task;
    }

    const cancelledTask = updateTask(task, {
      status: "cancelled",
      result: null,
      error: null
    });

    await this.replaceTask(tasks, cancelledTask);

    return cancelledTask;
  }

  public async runNext(
    authorizedTaskIds: readonly string[] = []
  ): Promise<AgentTask | null> {
    const tasks = await this.listTasks();
    const nextTask = tasks.find(
      (task) => task.status === "pending"
    );

    if (nextTask === undefined) {
      return null;
    }

    return this.executeTask(
      nextTask.id,
      authorizedTaskIds.includes(nextTask.id)
    );
  }

  public async listTasks():
    Promise<readonly AgentTask[]> {
    const raw = await this.storage.get(TasksKey);

    if (raw === null) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      return Array.isArray(parsed)
        ? parsed as AgentTask[]
        : [];
    } catch {
      await this.storage.remove(TasksKey);
      return [];
    }
  }

  public async snapshot(): Promise<AgentSnapshot> {
    const tasks = await this.listTasks();

    return {
      running: this.running,
      totalTasks: tasks.length,
      pendingTasks: countByStatus(tasks, "pending"),
      completedTasks: countByStatus(tasks, "completed"),
      failedTasks: countByStatus(tasks, "failed"),
      tasks
    };
  }

  private async replaceTask(
    tasks: readonly AgentTask[],
    updatedTask: AgentTask
  ): Promise<void> {
    await this.saveTasks(
      tasks.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task
      )
    );
  }

  private saveTasks(
    tasks: readonly AgentTask[]
  ): Promise<void> {
    return this.storage.set(
      TasksKey,
      JSON.stringify(tasks)
    );
  }
}

function updateTask(
  task: AgentTask,
  changes: Pick<
    AgentTask,
    "status" | "result" | "error"
  >
): AgentTask {
  return {
    ...task,
    ...changes,
    updatedAt: new Date().toISOString()
  };
}

function countByStatus(
  tasks: readonly AgentTask[],
  status: AgentTask["status"]
): number {
  return tasks.filter(
    (task) => task.status === status
  ).length;
}

function normalizeText(value: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(
      "Agent text value cannot be empty."
    );
  }

  return normalized;
}

function createIdentifier(prefix: string): string {
  const randomPart = Math.random()
    .toString(36)
    .slice(2);

  return `${prefix}-${Date.now()}-${randomPart}`;
}