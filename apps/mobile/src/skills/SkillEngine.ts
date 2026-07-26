import type{
Skill,
SkillSnapshot
}from"./SkillTypes.js";

export class SkillEngine{

private readonly skills=
new Map<string,Skill>();

public register(
skill:Skill
){

this.skills.set(
skill.id,
skill
);

}

public unregister(
id:string
){

this.skills.delete(id);

}

public list(){

return[
...this.skills.values()
];

}

public async execute(

id:string,

input:string

){

const skill=
this.skills.get(id);

if(!skill)
throw new Error(
"Skill not found."
);

if(!skill.enabled)
throw new Error(
"Skill disabled."
);

return skill.execute(
input
);

}

public snapshot():
SkillSnapshot{

const list=this.list();

return{

total:list.length,

enabled:list.filter(
s=>s.enabled
).length,

disabled:list.filter(
s=>!s.enabled
).length

};

}

}