export type RuntimeState=
"offline"|
"starting"|
"online"|
"stopping"|
"error";

export interface RuntimeService{

readonly id:string;

readonly state:RuntimeState;

readonly startedAt:string|null;

readonly updatedAt:string;

}

export interface RuntimeManagerSnapshot{

readonly state:RuntimeState;

readonly services:readonly RuntimeService[];

}