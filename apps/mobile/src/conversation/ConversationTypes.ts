export interface ConversationMessage{
readonly id:string;
readonly role:"system"|"user"|"assistant";
readonly content:string;
readonly createdAt:string;
}

export interface ConversationSession{
readonly id:string;
readonly title:string;
readonly messages:readonly ConversationMessage[];
readonly createdAt:string;
readonly updatedAt:string;
}