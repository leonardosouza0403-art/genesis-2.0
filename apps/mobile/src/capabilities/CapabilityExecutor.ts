import type { Capability } from './Capability.js';
import type { CapabilityRegistry } from './CapabilityRegistry.js';

export interface CapabilityExecutionResult {
  readonly success: boolean;
  readonly output?: unknown;
  readonly error?: string;
}

export class CapabilityExecutor {
  public constructor(private readonly registry: CapabilityRegistry) {}

  public async execute(id: string, params: Readonly<Record<string, unknown>>): Promise<CapabilityExecutionResult> {
    const capability = this.registry.get(id);

    if (capability === undefined) {
      return { success: false, error: `Capability '${id}' was not found in the registry.` };
    }

    if (!(await capability.isSupported())) {
      return { success: false, error: `Capability '${capability.name}' is not supported on this platform.` };
    }

    try {
      const output = await capability.execute(params);

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
