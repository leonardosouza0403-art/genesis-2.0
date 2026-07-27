import type{
SecurityEvent,
SecuritySnapshot,
SecurityLevel
}from"./SecurityTypes.js";

export class SecurityCore{

private readonly events:
SecurityEvent[]=[];

public log(

level:SecurityLevel,

source:string,

message:string

):SecurityEvent{

const event={

id:
"sec-"+Date.now(),

level,

source,

message,

createdAt:
new Date().toISOString()

};

this.events.push(event);

return event;

}

public history(){

return[
...this.events
];

}

public snapshot():
SecuritySnapshot{

return{

totalEvents:
this.events.length,

criticalEvents:
this.events.filter(
e=>e.level==="CRITICAL"
).length,

lastEvent:
this.events.at(-1) ?? null

};

}

public clear(){

this.events.length=0;

}

}