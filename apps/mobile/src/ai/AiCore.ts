import type { StorageAdapter } from "@genesis/platform";

import { KnowledgeKernel } from "../knowledge/index.js";
import { MemoryKernel } from "../memory/index.js";

import type { AiProvider } from "./AiProvider.js";
import type {
  AiContext,
  AiGoal,
  AiMessage,
  AiRequest,
  AiResponse
} from "./AiTypes.js";

const ConversationPrefix = "genesis.ai.conversation.";
const GoalsKey = "genesis.ai.goals";

export class AiCore {
  private readonly memory: MemoryKernel;
  private readonly knowledge: KnowledgeKernel;

  public constructor(
    private readonly storage: StorageAdapter,
    private readonly provider: AiProvider
  ) {
    this.memory = new MemoryKernel(storage);
    this.knowledge = new KnowledgeKernel(storage);
  }

  public async process(
    request: AiRequest
  ): Promise<AiResponse> {
    const input = normalizeText(request.input);

    await this.appendMessage(
      request.conversationId,
      createMessage("user", input)
    );

    const context = await this.buildContext(
      request.conversationId,
      input
    );

    const response = await this.provider.generate(context);

    await this.appendMessage(
      request.conversationId,
      createMessage("assistant", response.output)
    );

    await this.memory.remember(
      `conversation.last.${request.conversationId}`,
      {
        input,
        output: response.output,
        provider: response.provider,
        createdAt: response.createdAt
      }
    );

    return response;
  }

  public async buildContext(
    conversationId: string,
    input: string
  ): Promise<AiContext> {
    const [messages, memories, knowledgeNodes] =
      await Promise.all([
        this.loadConversation(conversationId),
        this.memory.list(),
        this.knowledge.search(input)
      ]);

    return {
      conversationId,
      messages,
      memories: memories.map(
        (entry) => `${entry.key}: ${JSON.stringify(entry.value)}`
      ),
      knowledge: knowledgeNodes.map(
        (node) => `${node.title}: ${node.content}`
      )
    };
  }

  public async createGoal(
    title: string,
    description: string
  ): Promise<AiGoal> {
    const goals = await this.listGoals();
    const now = new Date().toISOString();

    const goal: AiGoal = {
      id: createIdentifier("goal"),
      title: normalizeText(title),
      description: normalizeText(description),
      status: "pending",
      createdAt: now,
      updatedAt: now
    };

    await this.saveGoals([...goals, goal]);

    return goal;
  }

  public async updateGoalStatus(
    id: string,
    status: AiGoal["status"]
  ): Promise<AiGoal | null> {
    const goals = await this.listGoals();
    const target = goals.find((goal) => goal.id === id);

    if (target === undefined) {
      return null;
    }

    const updated: AiGoal = {
      ...target,
      status,
      updatedAt: new Date().toISOString()
    };

    await this.saveGoals(
      goals.map((goal) =>
        goal.id === id ? updated : goal
      )
    );

    return updated;
  }

  public async listGoals(): Promise<readonly AiGoal[]> {
    const raw = await this.storage.get(GoalsKey);

    if (raw === null) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      return Array.isArray(parsed)
        ? parsed as AiGoal[]
        : [];
    } catch {
      await this.storage.remove(GoalsKey);
      return [];
    }
  }

  public loadConversation(
    conversationId: string
  ): Promise<readonly AiMessage[]> {
    return this.readConversation(conversationId);
  }

  private async appendMessage(
    conversationId: string,
    message: AiMessage
  ): Promise<void> {
    const messages = await this.readConversation(
      conversationId
    );

    await this.storage.set(
      createConversationKey(conversationId),
      JSON.stringify([...messages, message])
    );
  }

  private async readConversation(
    conversationId: string
  ): Promise<readonly AiMessage[]> {
    const raw = await this.storage.get(
      createConversationKey(conversationId)
    );

    if (raw === null) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      return Array.isArray(parsed)
        ? parsed as AiMessage[]
        : [];
    } catch {
      await this.storage.remove(
        createConversationKey(conversationId)
      );

      return [];
    }
  }

  private saveGoals(
    goals: readonly AiGoal[]
  ): Promise<void> {
    return this.storage.set(
      GoalsKey,
      JSON.stringify(goals)
    );
  }
}

function createConversationKey(
  conversationId: string
): string {
  return `${ConversationPrefix}${normalizeText(conversationId)}`;
}

function createMessage(
  role: AiMessage["role"],
  content: string
): AiMessage {
  return {
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function normalizeText(value: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error("AI text value cannot be empty.");
  }

  return normalized;
}

function createIdentifier(prefix: string): string {
  const randomPart = Math.random()
    .toString(36)
    .slice(2);

  return `${prefix}-${Date.now()}-${randomPart}`;
}