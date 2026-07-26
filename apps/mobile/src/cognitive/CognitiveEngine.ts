import type { StorageAdapter } from "@genesis/platform";

import type { AiCore } from "../ai/index.js";

import type {
  CognitiveDecision,
  CognitiveDecisionRequest,
  CognitiveOption,
  CognitivePlan,
  CognitivePlanStep
} from "./CognitiveTypes.js";

const DecisionsKey = "genesis.cognitive.decisions";
const PlansKey = "genesis.cognitive.plans";

export class CognitiveEngine {
  public constructor(
    private readonly storage: StorageAdapter,
    private readonly aiCore?: AiCore
  ) {}

  public async decide(
    request: CognitiveDecisionRequest
  ): Promise<CognitiveDecision> {
    const objective = normalizeText(request.objective);

    if (request.options.length === 0) {
      throw new Error(
        "Cognitive decision requires at least one option."
      );
    }

    const scoredOptions = request.options.map((option) => ({
      option,
      score: calculateOptionScore(option)
    }));

    const selected = scoredOptions.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    const decision: CognitiveDecision = {
      id: createIdentifier("decision"),
      objective,
      selectedOptionId: selected.option.id,
      selectedOptionTitle: selected.option.title,
      score: selected.score,
      explanation: createExplanation(selected.option),
      createdAt: new Date().toISOString()
    };

    const decisions = await this.listDecisions();

    await this.storage.set(
      DecisionsKey,
      JSON.stringify([...decisions, decision])
    );

    return decision;
  }

  public async createPlan(
    objective: string,
    stepDescriptions: readonly string[]
  ): Promise<CognitivePlan> {
    const normalizedObjective = normalizeText(objective);

    if (stepDescriptions.length === 0) {
      throw new Error(
        "Cognitive plan requires at least one step."
      );
    }

    const now = new Date().toISOString();

    const steps: CognitivePlanStep[] =
      stepDescriptions.map((description, index) => ({
        id: createIdentifier("step"),
        order: index + 1,
        title: `Etapa ${index + 1}`,
        description: normalizeText(description),
        status: index === 0 ? "active" : "pending"
      }));

    const plan: CognitivePlan = {
      id: createIdentifier("plan"),
      objective: normalizedObjective,
      steps,
      createdAt: now,
      updatedAt: now
    };

    const plans = await this.listPlans();

    await this.storage.set(
      PlansKey,
      JSON.stringify([...plans, plan])
    );

    return plan;
  }

  public async updatePlanStep(
    planId: string,
    stepId: string,
    status: CognitivePlanStep["status"]
  ): Promise<CognitivePlan | null> {
    const plans = await this.listPlans();
    const target = plans.find((plan) => plan.id === planId);

    if (target === undefined) {
      return null;
    }

    const stepExists = target.steps.some(
      (step) => step.id === stepId
    );

    if (!stepExists) {
      return null;
    }

    const updatedPlan: CognitivePlan = {
      ...target,
      steps: target.steps.map((step) =>
        step.id === stepId
          ? { ...step, status }
          : step
      ),
      updatedAt: new Date().toISOString()
    };

    await this.storage.set(
      PlansKey,
      JSON.stringify(
        plans.map((plan) =>
          plan.id === planId ? updatedPlan : plan
        )
      )
    );

    return updatedPlan;
  }

  public async activateNextStep(
    planId: string
  ): Promise<CognitivePlan | null> {
    const plans = await this.listPlans();
    const target = plans.find((plan) => plan.id === planId);

    if (target === undefined) {
      return null;
    }

    const firstPending = target.steps.find(
      (step) => step.status === "pending"
    );

    if (firstPending === undefined) {
      return target;
    }

    const updatedPlan: CognitivePlan = {
      ...target,
      steps: target.steps.map((step) => {
        if (step.status === "active") {
          return { ...step, status: "completed" as const };
        }

        if (step.id === firstPending.id) {
          return { ...step, status: "active" as const };
        }

        return step;
      }),
      updatedAt: new Date().toISOString()
    };

    await this.storage.set(
      PlansKey,
      JSON.stringify(
        plans.map((plan) =>
          plan.id === planId ? updatedPlan : plan
        )
      )
    );

    return updatedPlan;
  }

  public async requestAiAssessment(
    conversationId: string,
    objective: string
  ): Promise<string | null> {
    if (this.aiCore === undefined) {
      return null;
    }

    const response = await this.aiCore.process({
      conversationId,
      input:
        `Analise este objetivo e proponha uma ação segura: ${normalizeText(objective)}`
    });

    return response.output;
  }

  public async listDecisions():
    Promise<readonly CognitiveDecision[]> {
    return this.readCollection<CognitiveDecision>(
      DecisionsKey
    );
  }

  public async listPlans():
    Promise<readonly CognitivePlan[]> {
    return this.readCollection<CognitivePlan>(
      PlansKey
    );
  }

  private async readCollection<T>(
    key: string
  ): Promise<readonly T[]> {
    const raw = await this.storage.get(key);

    if (raw === null) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed as T[] : [];
    } catch {
      await this.storage.remove(key);
      return [];
    }
  }
}

function calculateOptionScore(
  option: CognitiveOption
): number {
  return option.signals.reduce(
    (total, signal) =>
      total + signal.value * signal.weight,
    0
  );
}

function createExplanation(
  option: CognitiveOption
): readonly string[] {
  return option.signals
    .slice()
    .sort(
      (first, second) =>
        second.value * second.weight -
        first.value * first.weight
    )
    .map(
      (signal) =>
        `${signal.name}: ${signal.value} × ${signal.weight}`
    );
}

function normalizeText(value: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(
      "Cognitive text value cannot be empty."
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