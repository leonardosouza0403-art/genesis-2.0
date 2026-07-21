import { GenesisId, GenesisVersion, HealthStatus, ModuleState, ServiceId } from '@genesis/contracts';
import type { IKernel, IService } from '@genesis/contracts';
import { ServiceRegistry } from '../services/ServiceRegistry.js';
import { HealthService } from '../health/HealthService.js';

export class GenesisKernel implements IKernel {
  public readonly id: GenesisId;
  public readonly version: GenesisVersion;

  private readonly registry = new ServiceRegistry();
  private readonly healthService = new HealthService();
  private readonly serviceStates = new Map<string, ModuleState>();
  private initialized = false;

  constructor(id: GenesisId, version: GenesisVersion) {
    this.id = id;
    this.version = version;
  }

  public register(service: IService): void {
    this.registry.register(service);
    this.serviceStates.set(service.id.toString(), ModuleState.Stopped);
  }

  public getService(id: ServiceId): IService | undefined {
    return this.registry.get(id);
  }

  public getServices(): readonly IService[] {
    return this.registry.getAll();
  }

  public unregister(serviceId: ServiceId): boolean {
    const removed = this.registry.remove(serviceId);

    if (removed) {
      this.serviceStates.delete(serviceId.toString());
    }

    return removed;
  }

  public registerService(service: IService): void {
    this.register(service);
  }

  public resolveService<T>(serviceId: ServiceId): T | null {
    return this.registry.get(serviceId) as T | null;
  }

  public async start(): Promise<void> {
    await this.initialize();
  }

  public async stop(): Promise<void> {
    await this.shutdown();
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.updateAllServiceStates(ModuleState.Initializing);

    for (const service of this.registry.getAll()) {
      await service.initialize(this);
      this.serviceStates.set(service.id.toString(), ModuleState.Running);
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    for (const service of this.registry.getAll()) {
      await service.shutdown();
      this.serviceStates.set(service.id.toString(), ModuleState.Stopped);
    }

    this.initialized = false;
  }

  public async healthCheck(): Promise<HealthStatus> {
    return this.healthService.aggregate(Array.from(this.serviceStates.values()));
  }

  private updateAllServiceStates(state: ModuleState): void {
    for (const service of this.registry.getAll()) {
      this.serviceStates.set(service.id.toString(), state);
    }
  }
}
