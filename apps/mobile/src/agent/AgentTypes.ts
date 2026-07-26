export type AgentTaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type AgentRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface AgentTask {
  readonly id: string;
  readonly objective: string;
  readonly conversationId: string;
  readonly riskLevel: AgentRiskLevel;
  readonly requiresAuthorization: boolean;
  readonly status: AgentTaskStatus;
  readonly result: string | null;
  readonly error: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AgentTaskRequest {
  readonly objective: string;
  readonly conversationId: string;
  readonly riskLevel?: AgentRiskLevel;
  readonly requiresAuthorization?: boolean;
}

export interface AgentExecutor {
  execute(
    conversationId: string,
    objective: string
  ): Promise<string>;
}

export interface AgentSnapshot {
  readonly running: boolean;
  readonly totalTasks: number;
  readonly pendingTasks: number;
  readonly completedTasks: number;
  readonly failedTasks: number;
  readonly tasks: readonly AgentTask[];
}