export type ServiceState=
"idle"|
"starting"|
"running"|
"paused"|
"stopping"|
"stopped"|
"failed";

export interface ManagedService{

readonly id:string;

readonly state:ServiceState;

readonly startedAt:string|null;

readonly updatedAt:string;

}

export interface ServiceLifecycleSnapshot{

readonly services:readonly ManagedService[];

}