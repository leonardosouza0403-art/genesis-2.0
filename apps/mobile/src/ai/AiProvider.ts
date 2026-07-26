import type {
  AiContext,
  AiResponse
} from "./AiTypes.js";

export interface AiProvider {
  readonly name: string;

  generate(
    context: AiContext
  ): Promise<AiResponse>;
}