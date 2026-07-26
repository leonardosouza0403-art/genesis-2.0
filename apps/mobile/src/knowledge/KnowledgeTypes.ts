export interface KnowledgeNode {
  readonly id:string;
  readonly title:string;
  readonly content:string;
  readonly tags:readonly string[];
  readonly createdAt:string;
  readonly updatedAt:string;
}

export interface KnowledgeRelation {
  readonly from:string;
  readonly to:string;
  readonly type:string;
}

export interface KnowledgeSnapshot {
  readonly nodes:readonly KnowledgeNode[];
  readonly relations:readonly KnowledgeRelation[];
}