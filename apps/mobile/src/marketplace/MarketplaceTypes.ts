export interface PluginDescriptor{
  readonly id:string;
  readonly name:string;
  readonly version:string;
  readonly author:string;
  readonly description:string;
  readonly permissions:readonly string[];
  readonly installed:boolean;
}

export interface PluginMarketplaceProvider{

list():Promise<readonly PluginDescriptor[]>;

install(
pluginId:string
):Promise<void>;

uninstall(
pluginId:string
):Promise<void>;

}