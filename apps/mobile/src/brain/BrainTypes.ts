export interface GenesisContext {
  readonly conversationId:string;
  readonly input:string;
  readonly createdAt:string;
}

export interface GenesisBrainResponse{
  readonly success:boolean;
  readonly response:string;
  readonly createdAt:string;
}
