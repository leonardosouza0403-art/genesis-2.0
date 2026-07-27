import type{
ManagedService,
ServiceLifecycleSnapshot,
ServiceState
}from"./ServiceLifecycleTypes.js";

export class ServiceLifecycleManager{

private readonly services=
new Map<string,ManagedService>();

public register(
id:string
){

this.services.set(id,{

id,

state:"idle",

startedAt:null,

updatedAt:new Date().toISOString()

});

}

public transition(
id:string,
state:ServiceState
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
state==="running"
?(service.startedAt??
new Date().toISOString())
:service.startedAt,

updatedAt:
new Date().toISOString()

});

}

public remove(
id:string
){

this.services.delete(id);

}

public snapshot():
ServiceLifecycleSnapshot{

return{

services:[
...this.services.values()
]

};

}

public clear(){

this.services.clear();

}

}