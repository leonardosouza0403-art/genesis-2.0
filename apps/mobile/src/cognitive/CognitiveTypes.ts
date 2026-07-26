export interface CognitiveSignal {
  readonly name: string;
  readonly value: number;
  readonly weight: number;
}

export interface CognitiveOption {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly signals: readonly CognitiveSignal[];
}

export interface CognitiveDecisionRequest {
  readonly objective: string;
  readonly options: readonly CognitiveOption[];
}

export interface CognitiveDecision {
  readonly id: string;
  readonly objective: string;
  readonly selectedOptionId: string;
  readonly selectedOptionTitle: string;
  readonly score: number;
  readonly explanation: readonly string[];
  readonly createdAt: string;
}

export interface CognitivePlanStep {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly status: "pending" | "active" | "completed" | "cancelled";
}

export interface CognitivePlan {
  readonly id: string;
  readonly objective: string;
  readonly steps: readonly CognitivePlanStep[];
  readonly createdAt: string;
  readonly updatedAt: string;
}