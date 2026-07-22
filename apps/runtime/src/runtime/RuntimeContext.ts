import type { GenesisKernel } from '@genesis/core';
import type { ConfigurationManager } from '@genesis/core';
import type { ModuleLoader } from '@genesis/core';
import type { LifecycleManager } from '@genesis/core';
import type { EventBus } from '@genesis/core';

export interface RuntimeContext {
  readonly kernel: GenesisKernel;
  readonly configurationManager: ConfigurationManager;
  readonly moduleLoader: ModuleLoader;
  readonly lifecycleManager: LifecycleManager;
  readonly eventBus: EventBus;
}
