export type SecurityLevel=
|"LOW"
|"MEDIUM"
|"HIGH"
|"CRITICAL";

export interface SecurityEvent{

readonly id:string;
readonly level:SecurityLevel;
readonly source:string;
readonly message:string;
readonly createdAt:string;

}

export interface SecuritySnapshot{

readonly totalEvents:number;
readonly criticalEvents:number;
readonly lastEvent:SecurityEvent|null;

}