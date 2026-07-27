export interface RuntimeModule{

readonly id:string;

start():Promise<void>;

stop():Promise<void>;

health():Promise<boolean>;

}

export interface RuntimeSnapshot{

readonly running:boolean;

readonly modules:readonly string[];

readonly healthy:boolean;

}