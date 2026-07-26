import type {
VoiceProvider,
VoiceResponse
} from "./VoiceTypes.js";

import { GenesisKernel } from "../kernel/index.js";

export class VoiceCore{

constructor(

private readonly kernel:GenesisKernel,

private readonly provider:VoiceProvider

){}

public async listenAndProcess():
Promise<VoiceResponse>{

const command=
await this.provider.listen();

const response=
await this.kernel.think(
"voice",
command
);

await this.provider.speak(
response
);

return{
text:response,
spoken:true
};

}

}