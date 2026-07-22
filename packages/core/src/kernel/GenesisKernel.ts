import { GenesisId, GenesisVersion, HealthStatus, ModuleId, ModuleState, ServiceId } from '@genesis/contracts';
import type { IEvent, IKernel, IService } from '@genesis/contracts';
import { EventBus } from '../EventBus.js';
import { ServiceRegistry } from '../services/ServiceRegistry.js';
import { HealthService } from '../health/HealthService.js';
import { ConfigurationManager } from '../config/ConfigurationManager.js';
import { ModuleLoader } from '../modules/ModuleLoader.js';
import { LifecycleManager } from '../lifecycle/LifecycleManager.js';
import { LifecycleStates } from '../lifecycle/LifecycleTransition.js';
import type { ModuleDescriptor } from '../modules/ModuleDescriptor.js';

const KernelStartedEventType = 'KernelStarted' as const;
const KernelStoppingEventType = 'KernelStopping' as const;

export class GenesisKernel implements IKernel {
  public readonly id: GenesisId;
  public readonly version: GenesisVersion;
  public readonly configurationManager = new ConfigurationManager();
  public readonly moduleLoader = new ModuleLoader();
  public readonly lifecycleManager = new LifecycleManager();
  public readonly eventBus = new EventBus();

  private readonly registry = new ServiceRegistry();
  private readonly healthService = new HealthService();
  private readonly moduleToService = new Map<string, ServiceId>();
  private readonly serviceToModule = new Map<string, string>();
  private readonly startedServices: IService[] = [];
  private initialized = false;

  constructor(id: GenesisId, version: GenesisVersion) {
    this.id = id;
    this.version = version;
  }

  public register(service: IService): void {
    this.registry.register(service);
    this.bindServiceToModule(service);
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
      const serviceKey = serviceId.toString();
      const moduleKey = this.serviceToModule.get(serviceKey);

      this.serviceToModule.delete(serviceKey);

      if (moduleKey !== undefined) {
        this.moduleToService.delete(moduleKey);
      }
    }

    return removed;
  }

  public registerService(service: IService): void {
    this.register(service);
  }

  public registerModule(descriptor: ModuleDescriptor): void {
    this.moduleLoader.register(descriptor);

    if (this.lifecycleManager.getState(descriptor.id) === undefined) {
      this.lifecycleManager.register(descriptor.id);
    }

    const service = this.registry.get(ServiceId.create(descriptor.id.toString()));

    if (service !== undefined) {
      this.associateServiceWithModule(descriptor.id, service.id);
    }
  }

  public associateServiceWithModule(moduleId: ModuleId, serviceId: ServiceId): void {
    const moduleKey = moduleId.toString();
    const serviceKey = serviceId.toString();

    if (this.moduleLoader.get(moduleId) === undefined) {
      throw new Error(`Module '${moduleKey}' must be registered before it can be associated with a service.`);
    }

    if (this.moduleToService.has(moduleKey)) {
      throw new Error(`Module '${moduleKey}' is already associated with a service.`);
    }

    this.moduleToService.set(moduleKey, serviceId);
    this.serviceToModule.set(serviceKey, moduleKey);

    if (this.lifecycleManager.getState(moduleId) === undefined) {
      this.lifecycleManager.register(moduleId);
    }
  }

  public async boot(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.configurationManager.getAll();

    const modules = this.moduleLoader.resolveInitializationOrder();

    for (const descriptor of modules) {
      await this.initializeModule(descriptor);
    }

    await this.initializeRemainingServices();

    this.initialized = true;
    await this.publishEvent(KernelStartedEventType);
  }

  public async start(): Promise<void> {
    await this.boot();
  }

  public async stop(): Promise<void> {
    await this.shutdown();
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await this.publishEvent(KernelStoppingEventType);

    for (let index = this.startedServices.length - 1; index >= 0; index -= 1) {
      const service = this.startedServices[index]!;
      const moduleId = this.getModuleIdForService(service);
      const currentState = this.lifecycleManager.getState(moduleId);

      if (currentState === LifecycleStates.Running || currentState === LifecycleStates.Initializing) {
        this.lifecycleManager.transition(moduleId, LifecycleStates.Stopping);
      }

      await service.shutdown();

      if (this.lifecycleManager.getState(moduleId) === LifecycleStates.Stopping) {
        this.lifecycleManager.transition(moduleId, LifecycleStates.Stopped);
      }
    }

    this.startedServices.length = 0;
    this.configurationManager.clear();
    this.initialized = false;
  }

  public async healthCheck(): Promise<HealthStatus> {
    const states = Array.from(this.lifecycleManager.getAllStates().values()).map(
      (state): ModuleState => {
        if (state === LifecycleStates.Initializing || state === LifecycleStates.Running || state === LifecycleStates.Stopped || state === LifecycleStates.Failed) {
          return state;
        }

        return ModuleState.Failed;
      },
    );

    return this.healthService.aggregate(states);
  }

  public resolveService<T>(serviceId: ServiceId): T | null {
    return this.registry.get(serviceId) as T | null;
  }

  private async initializeModule(descriptor: ModuleDescriptor): Promise<void> {
    const moduleId = descriptor.id;

    if (this.lifecycleManager.getState(moduleId) === undefined) {
      this.lifecycleManager.register(moduleId);
    }

    this.lifecycleManager.transition(moduleId, LifecycleStates.Initializing);

    const service = this.getServiceForModule(moduleId);

    try {
      if (service !== undefined) {
        await service.initialize(this);
        this.startedServices.push(service);
      }

      this.lifecycleManager.transition(moduleId, LifecycleStates.Running);
    } catch (error) {
      this.lifecycleManager.transition(moduleId, LifecycleStates.Failed);
      throw error;
    }
  }

  private async initializeRemainingServices(): Promise<void> {
    for (const service of this.registry.getAll()) {
      if (this.startedServices.includes(service)) {
        continue;
      }

      const moduleId = this.getModuleIdForService(service);

      if (this.lifecycleManager.getState(moduleId) === undefined) {
        this.lifecycleManager.register(moduleId);
      }

      this.lifecycleManager.transition(moduleId, LifecycleStates.Initializing);
      await service.initialize(this);
      this.startedServices.push(service);
      this.lifecycleManager.transition(moduleId, LifecycleStates.Running);
    }
  }

  private publishEvent(type: string): Promise<void> {
    const event: IEvent = {
      id: this.id,
      occurredAt: new Date(),
      type,
      payload: Object.freeze({ version: this.version }),
    };

    return this.eventBus.publish(event);
  }

  private bindServiceToModule(service: IService): void {
    const serviceKey = service.id.toString();
    const moduleKey = this.serviceToModule.get(serviceKey) ?? serviceKey;
    const moduleId = ModuleId.create(moduleKey);

    if (this.lifecycleManager.getState(moduleId) === undefined) {
      this.lifecycleManager.register(moduleId);
    }

    this.serviceToModule.set(serviceKey, moduleKey);
    this.moduleToService.set(moduleKey, service.id);
  }

  private getServiceForModule(moduleId: ModuleId): IService | undefined {
    const mappedService = this.moduleToService.get(moduleId.toString());

    if (mappedService !== undefined) {
      return this.registry.get(mappedService);
    }

    return this.registry.get(ServiceId.create(moduleId.toString()));
  }

  private getModuleIdForService(service: IService): ModuleId {
    const moduleKey = this.serviceToModule.get(service.id.toString()) ?? service.id.toString();
    return ModuleId.create(moduleKey);
  }
}
