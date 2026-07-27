export type LogLevel=
| "debug"
| "info"
| "warning"
| "error";

export interface LogEntry{

readonly level:LogLevel;
readonly message:string;
readonly createdAt:string;
readonly metadata?:unknown;

}

export interface LoggerSnapshot{

readonly total:number;
readonly logs:readonly LogEntry[];

}