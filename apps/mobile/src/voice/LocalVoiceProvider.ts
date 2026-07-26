import type { VoiceProvider } from "./VoiceTypes.js";

export class LocalVoiceProvider
implements VoiceProvider{

public async listen():
Promise<string>{

return "";

}

public async speak(
text:string
):Promise<void>{

void text;

}

}