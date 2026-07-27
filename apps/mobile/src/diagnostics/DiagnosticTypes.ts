export interface DiagnosticCheck{

readonly name:string;
readonly healthy:boolean;
readonly message:string;
readonly checkedAt:string;

}

export interface DiagnosticSnapshot{

readonly healthy:boolean;
readonly checks:readonly DiagnosticCheck[];

}