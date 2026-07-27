import type{
LogEntry,
LogLevel,
LoggerSnapshot
}from"./LoggerTypes.js";

export class GenesisLogger{

private readonly logs:LogEntry[]=[];

public log(
level:LogLevel,
message:string,
metadata?:unknown
){

this.logs.push({

level,
message,
metadata,
createdAt:new Date().toISOString()

});

}

public debug(
message:string,
metadata?:unknown
){

this.log(
"debug",
message,
metadata
);

}

public info(
message:string,
metadata?:unknown
){

this.log(
"info",
message,
metadata
);

}

public warning(
message:string,
metadata?:unknown
){

this.log(
"warning",
message,
metadata
);

}

public error(
message:string,
metadata?:unknown
){

this.log(
"error",
message,
metadata
);

}

public snapshot():
LoggerSnapshot{

return{

total:this.logs.length,

logs:this.logs

};

}

public clear(){

this.logs.length=0;

}

}