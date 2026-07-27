export interface UserProfile{

readonly id:string;
readonly name:string;
readonly role:string;
readonly permissions:readonly string[];
readonly createdAt:string;
readonly updatedAt:string;

}

export interface ProfileSnapshot{

readonly current:UserProfile|null;

}