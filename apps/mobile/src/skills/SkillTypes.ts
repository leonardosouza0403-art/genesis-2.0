export interface Skill{

readonly id:string;
readonly name:string;
readonly description:string;
readonly version:string;
readonly enabled:boolean;

execute(
input:string
):Promise<string>;

}

export interface SkillSnapshot{

readonly total:number;
readonly enabled:number;
readonly disabled:number;

}