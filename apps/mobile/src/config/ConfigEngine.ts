import type{
ConfigSnapshot,
ConfigValue
}from"./ConfigTypes.js";

export class ConfigEngine{

private readonly values=
new Map<string,unknown>();

public set(
key:string,
value:unknown
){

this.values.set(
key,
value
);

}

public get<T>(
key:string
){

return this.values.get(
key
) as T|undefined;

}

public has(
key:string
){

return this.values.has(
key
);

}

public remove(
key:string
){

this.values.delete(
key
);

}

public clear(){

this.values.clear();

}

public snapshot():
ConfigSnapshot{

return{

values:
[...this.values.entries()]
.map(([key,value])=>({

key,
value

}))

};

}

}