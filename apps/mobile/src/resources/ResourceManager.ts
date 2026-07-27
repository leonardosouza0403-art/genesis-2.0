import type{
ManagedResource,
ResourceSnapshot
}from"./ResourceTypes.js";

export class ResourceManager{

private readonly resources=
new Map<string,ManagedResource>();

public allocate(
id:string,
type:string
){

this.resources.set(id,{

id,
type,
allocated:true,
createdAt:new Date().toISOString()

});

}

public release(
id:string
){

this.resources.delete(id);

}

public has(
id:string
){

return this.resources.has(id);

}

public snapshot():
ResourceSnapshot{

const resources=[
...this.resources.values()
];

return{

total:resources.length,

allocated:resources.length,

resources

};

}

public clear(){

this.resources.clear();

}

}