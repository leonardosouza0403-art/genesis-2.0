import type{
HealthComponent,
HealthSnapshot,
HealthStatus
}from"./HealthTypes.js";

export class HealthEngine{

private readonly components:HealthComponent[]=[];

public report(
id:string,
status:HealthStatus,
message:string
){

this.components.push({

id,
status,
message,
checkedAt:new Date().toISOString()

});

}

public snapshot():
HealthSnapshot{

const overall=
this.components.some(c=>c.status==="critical")
?"critical"
:this.components.some(c=>c.status==="warning")
?"warning"
:"healthy";

return{

overall,

components:this.components

};

}

public clear(){

this.components.length=0;

}

}