export type GenesisShellStatus =
  | "offline"
  | "starting"
  | "ready"
  | "processing"
  | "failed";

export interface GenesisShellCommand {
  readonly id: string;
  readonly conversationId: string;
  readonly input: string;
  readonly createdAt: string;
}

export interface GenesisShellResponse {
  readonly commandId: string;
  readonly conversationId: string;
  readonly output: string;
  readonly success: boolean;
  readonly createdAt: string;
  readonly error: string | null;
}

export interface GenesisShellSnapshot {
  readonly status: GenesisShellStatus;
  readonly commandCount: number;
  readonly lastCommand: GenesisShellCommand | null;
  readonly lastResponse: GenesisShellResponse | null;
  readonly error: string | null;
}