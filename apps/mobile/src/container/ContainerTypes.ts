export interface ServiceDescriptor<T=unknown>{

readonly id:string;

readonly instance:T;

}

export interface ContainerSnapshot{

readonly services:readonly string[];

}