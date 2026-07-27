import type{
TelemetryMetric,
TelemetrySnapshot
}from"./TelemetryTypes.js";

export class TelemetryEngine{

private readonly metrics:TelemetryMetric[]=[];

public record(
name:string,
value:number,
unit:string="count"
){

this.metrics.push({

name,
value,
unit,
timestamp:new Date().toISOString()

});

}

public latest(
name:string
){

return [...this.metrics]
.reverse()
.find(
metric=>metric.name===name
)??null;

}

public snapshot():
TelemetrySnapshot{

return{

metrics:this.metrics

};

}

public clear(){

this.metrics.length=0;

}

}