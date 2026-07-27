import type{
GenesisEvent,
EventHandler
}from"./EventTypes.js";

export class EventBus{

private readonly handlers=
new Map<string,Set<EventHandler>>();

public subscribe(
type:string,
handler:EventHandler
){

if(!this.handlers.has(type)){

this.handlers.set(
type,
new Set()
);

}

this.handlers
.get(type)!
.add(handler);

return()=>{

this.handlers
.get(type)
?.delete(handler);

};

}

public async publish<T>(
type:string,
payload:T
){

const event:GenesisEvent<T>={

type,
payload,
createdAt:new Date().toISOString()

};

const handlers=
this.handlers.get(type);

if(!handlers)return;

for(const handler of handlers){

await handler(event);

}

}

public clear(){

this.handlers.clear();

}

}