export interface KernelModule{

readonly id:string;

readonly version:string;

readonly description:string;

readonly enabled:boolean;

}

export interface RegistrySnapshot{

readonly total:number;

readonly enabled:number;

readonly modules:readonly KernelModule[];

}