export interface GenesisEvent<T=unknown>{

readonly type:string;
readonly payload:T;
readonly createdAt:string;

}

export type EventHandler<T=unknown>=(
event:GenesisEvent<T>
)=>void|Promise<void>;