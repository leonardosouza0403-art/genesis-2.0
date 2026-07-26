export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking";

export interface VoiceCommand {
  readonly id:string;
  readonly text:string;
  readonly createdAt:string;
}

export interface VoiceResponse {
  readonly text:string;
  readonly spoken:boolean;
}

export interface VoiceProvider {

  listen():Promise<string>;

  speak(
    text:string
  ):Promise<void>;

}