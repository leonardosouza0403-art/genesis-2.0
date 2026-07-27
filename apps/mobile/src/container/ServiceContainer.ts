import type{
ContainerSnapshot
}from"./ContainerTypes.js";

export class ServiceContainer{

private readonly services=
new Map<string,unknown>();

public register<T>(
id:string,
instance:T
){

this.services.set(
id,
instance
);

}

public resolve<T>(
id:string
):T{

const service=
this.services.get(id);

if(service===undefined){

throw new Error(
`Service '${id}' not found.`
);

}

return service as T;

}

public has(
id:string
){

return this.services.has(id);

}

public unregister(
id:string
){

this.services.delete(id);

}

public clear(){

this.services.clear();

}

public snapshot():
ContainerSnapshot{

return{

services:[
...this.services.keys()
]

};

}

}