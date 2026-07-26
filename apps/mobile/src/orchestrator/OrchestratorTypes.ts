import type { AiResponse } from "../ai/index.js";
import type {
  CognitiveDecision,
  CognitiveDecisionRequest,
  CognitivePlan
} from "../cognitive/index.js";
import type { MemoryEntry, MemoryValue } from "../memory/index.js";
import type { KnowledgeNode } from "../knowledge/index.js";
import type { CapabilityExecutionResult } from "../capabilities/CapabilityExecutor.js";

export type OrchestratorIntent =
  | "conversation"
  | "remember"
  | "recall"
  | "knowledge-search"
  | "decision"
  | "plan"
  | "capability";

export interface OrchestratorRequest {
  readonly intent: OrchestratorIntent;
  readonly conversationId?: string;
  readonly input?: string;
  readonly memoryKey?: string;
  readonly memoryValue?: MemoryValue;
  readonly decision?: CognitiveDecisionRequest;
  readonly objective?: string;
  readonly steps?: readonly string[];
  readonly capabilityId?: string;
  readonly capabilityParams?: Readonly<Record<string, unknown>>;
}

export interface OrchestratorResult {
  readonly success: boolean;
  readonly intent: OrchestratorIntent;
  readonly output?:
    | AiResponse
    | MemoryEntry
    | readonly KnowledgeNode[]
    | CognitiveDecision
    | CognitivePlan
    | CapabilityExecutionResult
    | null;
  readonly error?: string;
  readonly createdAt: string;
}