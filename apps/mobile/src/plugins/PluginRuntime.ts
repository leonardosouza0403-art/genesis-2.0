import type{
GenesisPlugin,
PluginSnapshot
}from"./PluginTypes.js";

export class PluginRuntime{

private readonly plugins=
new Map<string,GenesisPlugin>();

public async register(
plugin:GenesisPlugin
){

await plugin.initialize();

this.plugins.set(
plugin.id,
plugin
);

}

public async unregister(
id:string
){

const plugin=
this.plugins.get(id);

if(!plugin)return;

await plugin.shutdown();

this.plugins.delete(id);

}

public list(){

return[
...this.plugins.values()
];

}

public snapshot():
PluginSnapshot{

const list=this.list();

return{

total:list.length,

enabled:list.filter(
p=>p.enabled
).length,

disabled:list.filter(
p=>!p.enabled
).length,

plugins:list

};

}

}