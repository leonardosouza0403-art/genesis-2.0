export interface GenesisPlugin{

readonly id:string;
readonly name:string;
readonly version:string;
readonly author:string;
readonly enabled:boolean;

initialize():Promise<void>;

shutdown():Promise<void>;

}

export interface PluginSnapshot{

readonly total:number;
readonly enabled:number;
readonly disabled:number;
readonly plugins:readonly GenesisPlugin[];

}