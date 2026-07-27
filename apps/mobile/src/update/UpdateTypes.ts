export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "up-to-date"
  | "downloading"
  | "downloaded"
  | "installing"
  | "installed"
  | "failed";

export interface UpdateInfo {
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly hasUpdate: boolean;
  readonly releaseNotes: string;
  readonly publishedAt: string;
}

export interface UpdateSnapshot {
  readonly status: UpdateStatus;
  readonly info: UpdateInfo | null;
  readonly progress: number;
  readonly error: string | null;
}

export interface UpdateProvider {
  check(): Promise<UpdateInfo>;

  download(
    onProgress?: (progress: number) => void
  ): Promise<void>;

  install(): Promise<void>;
}