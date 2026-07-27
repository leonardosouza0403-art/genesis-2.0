export interface SystemMetric{

readonly name:string;
readonly value:number;
readonly unit:string;
readonly timestamp:string;

}

export interface SystemSnapshot{

readonly metrics:readonly SystemMetric[];

}