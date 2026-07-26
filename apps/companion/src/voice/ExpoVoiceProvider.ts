import * as Speech from "expo-speech";

import type {
  VoiceProvider
} from "@genesis/mobile/voice";

export interface ExpoVoiceProviderOptions {
  readonly language?: string;
  readonly rate?: number;
  readonly pitch?: number;
  readonly voice?: string;
}

export class ExpoVoiceProvider implements VoiceProvider {
  public constructor(
    private readonly options: ExpoVoiceProviderOptions = {}
  ) {}

  public async listen(): Promise<string> {
    throw new Error(
      "Speech recognition provider is not configured."
    );
  }

  public async speak(text: string): Promise<void> {
    const normalized = text.trim();

    if (normalized.length === 0) {
      return;
    }

    await Speech.stop();

    await new Promise<void>((resolve, reject) => {
      Speech.speak(normalized, {
        language: this.options.language ?? "pt-BR",
        rate: this.options.rate ?? 0.92,
        pitch: this.options.pitch ?? 1,
        voice: this.options.voice,
        onDone: resolve,
        onStopped: resolve,
        onError: (error) => {
          reject(
            new Error(
              typeof error === "string"
                ? error
                : "Falha ao reproduzir a voz do GENESIS."
            )
          );
        }
      });
    });
  }

  public async stop(): Promise<void> {
    await Speech.stop();
  }

  public async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }

  public async availableVoices():
    Promise<readonly Speech.Voice[]> {
    return Speech.getAvailableVoicesAsync();
  }
}