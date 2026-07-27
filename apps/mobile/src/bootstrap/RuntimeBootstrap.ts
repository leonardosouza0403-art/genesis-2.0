import type{
BootstrapModule,
BootstrapSnapshot
}from"./BootstrapTypes.js";

export class RuntimeBootstrap{

private readonly modules=
new Map<string,BootstrapModule>();

private initialized=false;

public register(
module:BootstrapModule
){

this.modules.set(
module.id,
module
);

}

public async initialize(){

if(this.initialized){

return;

}

for(const module of this.modules.values()){

await module.initialize();

}

this.initialized=true;

}

public async shutdown(){

const modules=
[...this.modules.values()]
.reverse();

for(const module of modules){

if(module.shutdown){

await module.shutdown();

}

}

this.initialized=false;

}

public snapshot():
BootstrapSnapshot{

return{

initialized:this.initialized,

modules:[
...this.modules.keys()
]

};

}

}