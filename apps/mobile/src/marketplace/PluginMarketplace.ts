import type{
PluginDescriptor,
PluginMarketplaceProvider
} from "./MarketplaceTypes.js";

export class PluginMarketplace{

constructor(
private readonly provider:PluginMarketplaceProvider
){}

public list(){
return this.provider.list();
}

public install(
pluginId:string
){
return this.provider.install(pluginId);
}

public uninstall(
pluginId:string
){
return this.provider.uninstall(pluginId);
}

public async installed(){

return (await this.list()).filter(
plugin=>plugin.installed
);

}

}