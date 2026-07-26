import {
  UpdateEngine,
  type UpdateProvider,
  type UpdateSnapshot
} from "../update/index.js";

export class KernelUpdateController {
  private readonly engine: UpdateEngine;

  public constructor(provider: UpdateProvider) {
    this.engine = new UpdateEngine(provider);
  }

  public check(): Promise<UpdateSnapshot> {
    return this.engine.check();
  }

  public download(
    authorized: boolean
  ): Promise<UpdateSnapshot> {
    return this.engine.download(authorized);
  }

  public install(
    authorized: boolean
  ): Promise<UpdateSnapshot> {
    return this.engine.install(authorized);
  }

  public snapshot(): UpdateSnapshot {
    return this.engine.snapshot();
  }
}