import type { AiCore } from "../ai/index.js";
import type { CognitiveEngine } from "../cognitive/index.js";
import type { MemoryKernel } from "../memory/index.js";
import type { KnowledgeKernel } from "../knowledge/index.js";
import type { GenesisOrchestrator } from "../orchestrator/index.js";

import type {
GenesisContext,
GenesisBrainResponse
} from "./BrainTypes.js";

export class GenesisBrain{

constructor(
private readonly ai:AiCore,
private readonly cognitive:CognitiveEngine,
private readonly memory:MemoryKernel,
private readonly knowledge:KnowledgeKernel,
private readonly orchestrator:GenesisOrchestrator
){}

public async think(
context:GenesisContext
):Promise<GenesisBrainResponse>{

await this.memory.remember(
"last.user.message",
context.input
);

const result=await this.orchestrator.execute({
intent:"conversation",
conversationId:context.conversationId,
input:context.input
});

return{
success:result.success,
response:
result.success
?String((result.output as any)?.output ?? "OK")
:(result.error ?? "Unknown error"),
createdAt:new Date().toISOString()
};

}

}
