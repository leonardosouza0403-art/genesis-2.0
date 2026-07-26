import type { AiCore } from "../ai/index.js";
import type { CognitiveEngine } from "../cognitive/index.js";
import type { KnowledgeKernel } from "../knowledge/index.js";
import type { MemoryKernel } from "../memory/index.js";
import type { CapabilityExecutionResult } from "../capabilities/CapabilityExecutor.js";

import type {
  OrchestratorRequest,
  OrchestratorResult
} from "./OrchestratorTypes.js";

export interface GenesisOrchestratorDependencies {
  readonly ai: AiCore;
  readonly cognitive: CognitiveEngine;
  readonly memory: MemoryKernel;
  readonly knowledge: KnowledgeKernel;
  readonly executeCapability: (
    id: string,
    params: Readonly<Record<string, unknown>>
  ) => Promise<CapabilityExecutionResult>;
}

export class GenesisOrchestrator {
  public constructor(
    private readonly dependencies: GenesisOrchestratorDependencies
  ) {}

  public async execute(
    request: OrchestratorRequest
  ): Promise<OrchestratorResult> {
    try {
      const output = await this.dispatch(request);

      return output === undefined
        ? {
            success: true,
            intent: request.intent,
            createdAt: new Date().toISOString()
          }
        : {
            success: true,
            intent: request.intent,
            output,
            createdAt: new Date().toISOString()
          };
    } catch (error) {
      return {
        success: false,
        intent: request.intent,
        error: error instanceof Error
          ? error.message
          : String(error),
        createdAt: new Date().toISOString()
      };
    }
  }

  private async dispatch(
    request: OrchestratorRequest
  ): Promise<OrchestratorResult["output"]> {
    switch (request.intent) {
      case "conversation":
        return this.dependencies.ai.process({
          conversationId: requireText(
            request.conversationId,
            "conversationId"
          ),
          input: requireText(request.input, "input")
        });

      case "remember":
        return this.dependencies.memory.remember(
          requireText(request.memoryKey, "memoryKey"),
          requireValue(request.memoryValue, "memoryValue")
        );

      case "recall":
        return this.dependencies.memory.recall(
          requireText(request.memoryKey, "memoryKey")
        );

      case "knowledge-search":
        return this.dependencies.knowledge.search(
          requireText(request.input, "input")
        );

      case "decision":
        if (request.decision === undefined) {
          throw new Error(
            "decision is required for decision intent."
          );
        }

        return this.dependencies.cognitive.decide(
          request.decision
        );

      case "plan":
        return this.dependencies.cognitive.createPlan(
          requireText(request.objective, "objective"),
          requireSteps(request.steps)
        );

      case "capability":
        return this.dependencies.executeCapability(
          requireText(
            request.capabilityId,
            "capabilityId"
          ),
          request.capabilityParams ?? {}
        );
    }
  }
}

function requireText(
  value: string | undefined,
  field: string
): string {
  const normalized = value?.trim();

  if (normalized === undefined || normalized.length === 0) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function requireValue<T>(
  value: T | undefined,
  field: string
): T {
  if (value === undefined) {
    throw new Error(`${field} is required.`);
  }

  return value;
}

function requireSteps(
  steps: readonly string[] | undefined
): readonly string[] {
  if (steps === undefined || steps.length === 0) {
    throw new Error("steps are required.");
  }

  return steps;
}