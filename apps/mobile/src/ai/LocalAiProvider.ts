import type {
  AiContext,
  AiProvider,
  AiResponse
} from "./index.js";

export class LocalAiProvider implements AiProvider {
  public readonly name = "genesis-local";

  public async generate(
    context: AiContext
  ): Promise<AiResponse> {
    const lastMessage =
      context.messages.at(-1)?.content ?? "";

    const output = this.createResponse(
      lastMessage,
      context
    );

    return {
      conversationId: context.conversationId,
      output,
      createdAt: new Date().toISOString(),
      provider: this.name
    };
  }

  private createResponse(
    input: string,
    context: AiContext
  ): string {
    const normalized = input.toLowerCase();

    if (normalized.includes("quem é você")) {
      return "Sou o GENESIS 2.0, seu companheiro tecnológico.";
    }

    if (
      normalized.includes("como você está") ||
      normalized.includes("status")
    ) {
      return "Estou online, com memória, conhecimento e capacidades disponíveis.";
    }

    if (
      normalized.includes("bom dia") ||
      normalized.includes("boa tarde") ||
      normalized.includes("boa noite")
    ) {
      return "Olá, Senhor Leonardo. Estou pronto para acompanhá-lo.";
    }

    if (context.knowledge.length > 0) {
      return `Encontrei conhecimento relacionado: ${context.knowledge[0]}`;
    }

    if (context.memories.length > 0) {
      return `Consultei minha memória. ${context.memories[0]}`;
    }

    return `Entendi: ${input}`;
  }
}