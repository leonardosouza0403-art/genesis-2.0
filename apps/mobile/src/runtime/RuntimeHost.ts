import type{
RuntimeModule,
RuntimeSnapshot
}from"./RuntimeTypes.js";

export class RuntimeHost{

private readonly modules=
new Map<string,RuntimeModule>();

private running=false;

public register(
module:RuntimeModule
){

this.modules.set(
module.id,
module
);

}

public async start(){

if(this.running){

return;

}

for(const module of this.modules.values()){

await module.start();

}

this.running=true;

}

public async stop(){

const modules=
[...this.modules.values()]
.reverse();

for(const module of modules){

await module.stop();

}

this.running=false;

}

public async snapshot():
Promise<RuntimeSnapshot>{

const health=
await Promise.all(

[...this.modules.values()]
.map(
module=>module.health()
)

);

return{

running:this.running,

modules:[
...this.modules.keys()
],

healthy:
health.every(Boolean)

};

}

}