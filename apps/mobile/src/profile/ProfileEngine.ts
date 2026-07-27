import type{
ProfileSnapshot,
UserProfile
}from"./ProfileTypes.js";

export class ProfileEngine{

private profile:UserProfile|null=null;

public load(
profile:UserProfile
){

this.profile=profile;

}

public current(){

return this.profile;

}

public hasPermission(
permission:string
){

return this.profile?.permissions.includes(
permission
)??false;

}

public snapshot():
ProfileSnapshot{

return{

current:this.profile

};

}

public unload(){

this.profile=null;

}

}