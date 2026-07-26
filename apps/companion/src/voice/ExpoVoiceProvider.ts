import Voice from "@react-native-voice/voice";
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
    return new Promise<string>((resolve, reject) => {
      let finished = false;

      const cleanup = async (): Promise<void> => {
        Voice.onSpeechResults = () => {};
        Voice.onSpeechError = () => {};

        try {
          await Voice.destroy();
        } catch {
          // Ignora falha de limpeza.
        }
      };

      Voice.onSpeechResults = (event) => {
        if (finished) {
          return;
        }

        finished = true;

        const result = event.value?.[0]?.trim() ?? "";

        void cleanup().finally(() => {
          if (result.length === 0) {
            reject(
              new Error("Nenhuma fala foi reconhecida.")
            );
            return;
          }

          resolve(result);
        });
      };

      Voice.onSpeechError = (event) => {
        if (finished) {
          return;
        }

        finished = true;

        void cleanup().finally(() => {
          reject(
            new Error(
              typeof event.error?.message === "string"
                ? event.error.message
                : JSON.stringify(event.error)
            )
          );
        });
      };

      void Voice.start(
        this.options.language ?? "pt-BR"
      ).catch((error: unknown) => {
        if (finished) {
          return;
        }

        finished = true;

        void cleanup().finally(() => {
          reject(
            error instanceof Error
              ? error
              : new Error(String(error))
          );
        });
      });
    });
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
    await Promise.allSettled([
      Speech.stop(),
      Voice.stop()
    ]);
  }

  public isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }

  public availableVoices():
    Promise<readonly Speech.Voice[]> {
    return Speech.getAvailableVoicesAsync();
  }
}