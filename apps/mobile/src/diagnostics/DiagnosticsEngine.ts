import type{
DiagnosticCheck,
DiagnosticSnapshot
}from"./DiagnosticTypes.js";

export class DiagnosticsEngine{

private readonly checks:DiagnosticCheck[]=[];

public add(
name:string,
healthy:boolean,
message:string
){

this.checks.push({

name,
healthy,
message,
checkedAt:new Date().toISOString()

});

}

public healthy(){

return this.checks.every(
check=>check.healthy
);

}

public snapshot():
DiagnosticSnapshot{

return{

healthy:this.healthy(),

checks:this.checks

};

}

public clear(){

this.checks.length=0;

}

}