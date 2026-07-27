export type HealthStatus=
"healthy"|
"warning"|
"critical";

export interface HealthComponent{

readonly id:string;
readonly status:HealthStatus;
readonly message:string;
readonly checkedAt:string;

}

export interface HealthSnapshot{

readonly overall:HealthStatus;
readonly components:readonly HealthComponent[];

}