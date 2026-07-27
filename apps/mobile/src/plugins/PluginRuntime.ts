import type{
GenesisPlugin,
PluginRuntimeSnapshot
}from"./PluginRuntimeTypes.js";

export class PluginRuntime{

private readonly plugins=
new Map<string,GenesisPlugin>();

private running=false;

public register(
plugin:GenesisPlugin
){

this.plugins.set(
plugin.id,
plugin
);

}

public async start(){

for(const plugin of this.plugins.values()){

await plugin.start();

}

this.running=true;

}

public async stop(){

for(const plugin of this.plugins.values()){

await plugin.stop();

}

this.running=false;

}

public snapshot():
PluginRuntimeSnapshot{

return{

running:this.running,

loadedPlugins:[
...this.plugins.keys()
]

};

}

}