export interface Session{

readonly id:string;
readonly startedAt:string;
readonly endedAt:string|null;
readonly active:boolean;

}

export interface SessionSnapshot{

readonly current:Session|null;
readonly history:readonly Session[];

}