export interface BootstrapModule{

readonly id:string;

initialize():Promise<void>;

shutdown?():Promise<void>;

}

export interface BootstrapSnapshot{

readonly initialized:boolean;

readonly modules:readonly string[];

}