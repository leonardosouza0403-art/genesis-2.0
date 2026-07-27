export interface ConfigValue{

readonly key:string;
readonly value:unknown;

}

export interface ConfigSnapshot{

readonly values:readonly ConfigValue[];

}