import { ServiceId } from '../foundation/ServiceId.js';
import type { IKernel } from './IKernel.js';

export interface IService {
  readonly id: ServiceId;
  initialize(kernel: IKernel): Promise<void>;
  shutdown(): Promise<void>;
}
