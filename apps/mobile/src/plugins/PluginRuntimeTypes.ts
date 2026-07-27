export interface GenesisPlugin{

readonly id:string;
readonly version:string;

start():Promise<void>;

stop():Promise<void>;

}

export interface PluginRuntimeSnapshot{

readonly running:boolean;
readonly loadedPlugins:readonly string[];

}