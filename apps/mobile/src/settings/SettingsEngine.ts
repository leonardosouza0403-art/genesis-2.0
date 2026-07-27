import type{
GenesisSettings,
SettingsSnapshot
}from"./SettingsTypes.js";

export class SettingsEngine{

private settings:GenesisSettings={

language:"pt-BR",

theme:"dark",

voiceEnabled:true,

autoUpdate:true

};

public get(){

return this.settings;

}

public update(
settings:Partial<GenesisSettings>
){

this.settings={

...this.settings,

...settings

};

return this.settings;

}

public reset(){

this.settings={

language:"pt-BR",

theme:"dark",

voiceEnabled:true,

autoUpdate:true

};

}

public snapshot():
SettingsSnapshot{

return{

settings:this.settings

};

}

}