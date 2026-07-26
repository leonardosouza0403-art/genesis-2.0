import type { StorageAdapter } from "@genesis/platform";
import type {
KnowledgeNode,
KnowledgeRelation,
KnowledgeSnapshot
} from "./KnowledgeTypes.js";

const NodesKey="genesis.knowledge.nodes";
const RelationsKey="genesis.knowledge.relations";

export class KnowledgeKernel{

constructor(private readonly storage:StorageAdapter){}

public async addNode(node:KnowledgeNode){
const list=await this.nodes();
await this.storage.set(NodesKey,JSON.stringify([...list,node]));
}

public async addRelation(relation:KnowledgeRelation){
const list=await this.relations();
await this.storage.set(RelationsKey,JSON.stringify([...list,relation]));
}

public async nodes():Promise<KnowledgeNode[]>{
const raw=await this.storage.get(NodesKey);
return raw?JSON.parse(raw):[];
}

public async relations():Promise<KnowledgeRelation[]>{
const raw=await this.storage.get(RelationsKey);
return raw?JSON.parse(raw):[];
}

public async search(text:string){
const query=text.toLowerCase();

return (await this.nodes()).filter(n=>
n.title.toLowerCase().includes(query)||
n.content.toLowerCase().includes(query)||
n.tags.some(t=>t.toLowerCase().includes(query))
);
}

public async snapshot():Promise<KnowledgeSnapshot>{
return{
nodes:await this.nodes(),
relations:await this.relations()
};
}

}