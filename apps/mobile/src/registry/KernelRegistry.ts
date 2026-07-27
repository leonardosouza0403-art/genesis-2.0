import type{
KernelModule,
RegistrySnapshot
}from"./RegistryTypes.js";

export class KernelRegistry{

private readonly modules=
new Map<string,KernelModule>();

public register(
module:KernelModule
){

this.modules.set(
module.id,
module
);

}

public unregister(
id:string
){

this.modules.delete(id);

}

public enable(
id:string
){

const module=
this.modules.get(id);

if(!module){

return;

}

this.modules.set(id,{

...module,

enabled:true

});

}

public disable(
id:string
){

const module=
this.modules.get(id);

if(!module){

return;

}

this.modules.set(id,{

...module,

enabled:false

});

}

public get(
id:string
){

return this.modules.get(id)??null;

}

public snapshot():
RegistrySnapshot{

const modules=[
...this.modules.values()
];

return{

total:modules.length,

enabled:
modules.filter(
m=>m.enabled
).length,

modules

};

}

public clear(){

this.modules.clear();

}

}