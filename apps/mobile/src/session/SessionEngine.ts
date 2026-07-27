import type{
Session,
SessionSnapshot
}from"./SessionTypes.js";

export class SessionEngine{

private readonly history:Session[]=[];

private currentSession:Session|null=null;

public start(){

if(this.currentSession){

return this.currentSession;

}

this.currentSession={

id:
crypto.randomUUID(),

startedAt:
new Date().toISOString(),

endedAt:null,

active:true

};

this.history.push(
this.currentSession
);

return this.currentSession;

}

public stop(){

if(!this.currentSession){

return null;

}

this.currentSession={

...this.currentSession,

endedAt:
new Date().toISOString(),

active:false

};

this.history[
this.history.length-1
]=this.currentSession;

const finished=
this.currentSession;

this.currentSession=null;

return finished;

}

public current(){

return this.currentSession;

}

public snapshot():
SessionSnapshot{

return{

current:this.currentSession,

history:this.history

};

}

}