import type {StorageAdapter} from "@genesis/platform";
import type{
ConversationMessage,
ConversationSession
} from "./ConversationTypes.js";

const KEY="genesis.conversations";

export class ConversationEngine{

constructor(
private readonly storage:StorageAdapter
){}

public async sessions():
Promise<ConversationSession[]>{

const raw=await this.storage.get(KEY);

return raw
?JSON.parse(raw)
:[];

}

public async create(
title:string
):Promise<ConversationSession>{

const list=await this.sessions();

const now=new Date().toISOString();

const session:ConversationSession={

id:
"conv-"+Date.now(),

title,

messages:[],

createdAt:now,

updatedAt:now

};

await this.save([
...list,
session
]);

return session;

}

public async addMessage(

sessionId:string,

message:ConversationMessage

){

const list=await this.sessions();

await this.save(

list.map(s=>

s.id===sessionId

?{

...s,

messages:[
...s.messages,
message
],

updatedAt:
new Date().toISOString()

}

:s

)

);

}

private save(

sessions:
readonly ConversationSession[]

){

return this.storage.set(

KEY,

JSON.stringify(sessions)

);

}

}