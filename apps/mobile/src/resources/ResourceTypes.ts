export interface ManagedResource{

readonly id:string;

readonly type:string;

readonly allocated:boolean;

readonly createdAt:string;

}

export interface ResourceSnapshot{

readonly total:number;

readonly allocated:number;

readonly resources:readonly ManagedResource[];

}