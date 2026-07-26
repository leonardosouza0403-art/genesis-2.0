export type AiRole =
  | "system"
  | "user"
  | "assistant";

export interface AiMessage {
  readonly role: AiRole;
  readonly content: string;
  readonly createdAt: string;
}

export interface AiContext {
  readonly conversationId: string;
  readonly messages: readonly AiMessage[];
  readonly memories: readonly string[];
  readonly knowledge: readonly string[];
}

export interface AiRequest {
  readonly conversationId: string;
  readonly input: string;
}

export interface AiResponse {
  readonly conversationId: string;
  readonly output: string;
  readonly createdAt: string;
  readonly provider: string;
}

export interface AiGoal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: "pending" | "active" | "completed" | "cancelled";
  readonly createdAt: string;
  readonly updatedAt: string;
}