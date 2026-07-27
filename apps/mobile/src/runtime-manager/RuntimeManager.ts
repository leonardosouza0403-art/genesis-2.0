import type{
RuntimeManagerSnapshot,
RuntimeService,
RuntimeState
}from"./RuntimeManagerTypes.js";

export class RuntimeManager{

private state:RuntimeState="offline";

private readonly services=
new Map<string,RuntimeService>();

public setState(
state:RuntimeState
){

this.state=state;

}

public register(
id:string
){

this.services.set(id,{

id,

state:"offline",

startedAt:null,

updatedAt:new Date().toISOString()

});

}

public update(
id:string,
state:RuntimeState
){

const service=
this.services.get(id);

if(!service){

return;

}

this.services.set(id,{

...service,

state,

startedAt:
state==="online"
?service.startedAt??
new Date().toISOString()
:service.startedAt,

updatedAt:
new Date().toISOString()

});

}

public unregister(
id:string
){

this.services.delete(id);

}

public snapshot():
RuntimeManagerSnapshot{

return{

state:this.state,

services:[
...this.services.values()
]

};

}

public clear(){

this.services.clear();

this.state="offline";

}

}