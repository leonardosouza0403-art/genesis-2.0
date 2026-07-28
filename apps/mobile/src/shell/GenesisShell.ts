import type {
  GenesisOS
} from "../os/index.js";

import type {
  GenesisShellCommand,
  GenesisShellResponse,
  GenesisShellSnapshot,
  GenesisShellStatus
} from "./GenesisShellTypes.js";

export class GenesisShell {
  private status: GenesisShellStatus = "offline";
  private commandCount = 0;
  private lastCommand: GenesisShellCommand | null = null;
  private lastResponse: GenesisShellResponse | null = null;
  private error: string | null = null;

  public constructor(
    private readonly os: GenesisOS
  ) {}

  public async start(): Promise<GenesisShellSnapshot> {
    if (this.status === "ready") {
      return this.snapshot();
    }

    this.status = "starting";
    this.error = null;

    const osSnapshot = await this.os.boot();

    if (osSnapshot.status !== "online") {
      this.status = "failed";
      this.error =
        osSnapshot.error ??
        "Genesis OS failed to start.";

      return this.snapshot();
    }

    this.status = "ready";

    return this.snapshot();
  }

  public async execute(
    conversationId: string,
    input: string
  ): Promise<GenesisShellResponse> {
    if (this.status !== "ready") {
      throw new Error(
        "Genesis Shell is not ready."
      );
    }

    const command: GenesisShellCommand = {
      id: createIdentifier("command"),
      conversationId: normalizeText(
        conversationId,
        "conversationId"
      ),
      input: normalizeText(input, "input"),
      createdAt: new Date().toISOString()
    };

    this.status = "processing";
    this.lastCommand = command;
    this.commandCount += 1;
    this.error = null;

    try {
      const output = await this.os.think(
        command.conversationId,
        command.input
      );

      const response: GenesisShellResponse = {
        commandId: command.id,
        conversationId: command.conversationId,
        output,
        success: true,
        createdAt: new Date().toISOString(),
        error: null
      };

      this.lastResponse = response;
      this.status = "ready";

      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      const response: GenesisShellResponse = {
        commandId: command.id,
        conversationId: command.conversationId,
        output: "",
        success: false,
        createdAt: new Date().toISOString(),
        error: message
      };

      this.lastResponse = response;
      this.error = message;
      this.status = "ready";

      return response;
    }
  }

  public stop(): GenesisShellSnapshot {
    this.os.shutdown();
    this.status = "offline";

    return this.snapshot();
  }

  public snapshot(): GenesisShellSnapshot {
    return {
      status: this.status,
      commandCount: this.commandCount,
      lastCommand: this.lastCommand,
      lastResponse: this.lastResponse,
      error: this.error
    };
  }
}

function normalizeText(
  value: string,
  field: string
): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(
      `${field} cannot be empty.`
    );
  }

  return normalized;
}

function createIdentifier(
  prefix: string
): string {
  return [
    prefix,
    Date.now(),
    Math.random().toString(36).slice(2)
  ].join("-");
}