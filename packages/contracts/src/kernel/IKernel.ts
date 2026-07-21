import type { IService } from './IService.js';
import { ServiceId } from '../foundation/ServiceId.js';
import { GenesisId } from '../foundation/GenesisId.js';
import { GenesisVersion } from '../foundation/GenesisVersion.js';

export interface IKernel {
  readonly id: GenesisId;
  readonly version: GenesisVersion;
  registerService(service: IService): void;
  resolveService<T>(serviceId: ServiceId): T | null;
  start(): Promise<void>;
  stop(): Promise<void>;
}
