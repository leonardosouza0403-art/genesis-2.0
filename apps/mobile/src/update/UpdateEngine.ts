import type {
  UpdateInfo,
  UpdateProvider,
  UpdateSnapshot,
  UpdateStatus
} from "./UpdateTypes.js";

export class UpdateEngine {
  private status: UpdateStatus = "idle";
  private info: UpdateInfo | null = null;
  private progress = 0;
  private error: string | null = null;

  public constructor(
    private readonly provider: UpdateProvider
  ) {}

  public async check(): Promise<UpdateSnapshot> {
    this.status = "checking";
    this.error = null;
    this.progress = 0;

    try {
      this.info = await this.provider.check();

      this.status = this.info.hasUpdate
        ? "available"
        : "up-to-date";
    } catch (error) {
      this.fail(error);
    }

    return this.snapshot();
  }

  public async download(
    authorized = false
  ): Promise<UpdateSnapshot> {
    if (!authorized) {
      throw new Error(
        "Update download requires explicit authorization."
      );
    }

    if (this.info === null || !this.info.hasUpdate) {
      throw new Error(
        "No update is available for download."
      );
    }

    this.status = "downloading";
    this.error = null;
    this.progress = 0;

    try {
      await this.provider.download((progress) => {
        this.progress = normalizeProgress(progress);
      });

      this.progress = 100;
      this.status = "downloaded";
    } catch (error) {
      this.fail(error);
    }

    return this.snapshot();
  }

  public async install(
    authorized = false
  ): Promise<UpdateSnapshot> {
    if (!authorized) {
      throw new Error(
        "Update installation requires explicit authorization."
      );
    }

    if (this.status !== "downloaded") {
      throw new Error(
        "The update must be downloaded before installation."
      );
    }

    this.status = "installing";
    this.error = null;

    try {
      await this.provider.install();
      this.status = "installed";
    } catch (error) {
      this.fail(error);
    }

    return this.snapshot();
  }

  public snapshot(): UpdateSnapshot {
    return {
      status: this.status,
      info: this.info,
      progress: this.progress,
      error: this.error
    };
  }

  private fail(error: unknown): void {
    this.status = "failed";
    this.error =
      error instanceof Error
        ? error.message
        : String(error);
  }
}

function normalizeProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
}