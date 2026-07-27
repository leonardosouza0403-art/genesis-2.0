import type{
SystemMetric,
SystemSnapshot
}from"./SystemMonitorTypes.js";

export class SystemMonitor{

private readonly metrics:SystemMetric[]=[];

public record(
name:string,
value:number,
unit:string
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
SystemSnapshot{

return{

metrics:this.metrics

};

}

public clear(){

this.metrics.length=0;

}

}