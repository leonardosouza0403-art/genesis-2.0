export interface TelemetryMetric{

readonly name:string;
readonly value:number;
readonly unit:string;
readonly timestamp:string;

}

export interface TelemetrySnapshot{

readonly metrics:readonly TelemetryMetric[];

}