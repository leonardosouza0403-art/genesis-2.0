export interface GenesisSettings{

readonly language:string;
readonly theme:string;
readonly voiceEnabled:boolean;
readonly autoUpdate:boolean;

}

export interface SettingsSnapshot{

readonly settings:GenesisSettings;

}