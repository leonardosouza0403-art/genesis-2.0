import type { IService, ServiceId } from '@genesis/contracts';

export class ServiceRegistry {
  private readonly services = new Map<ServiceId, IService>();

  public register(service: IService): void {
    if (this.get(service.id) !== undefined) {
      throw new Error(`Service with id ${service.id.toString()} is already registered`);
    }

    this.services.set(service.id, service);
  }

  public get(id: ServiceId): IService | undefined {
    const directMatch = this.services.get(id);

    if (directMatch !== undefined) {
      return directMatch;
    }

    for (const [key, service] of this.services.entries()) {
      if (key.equals(id)) {
        return service;
      }
    }

    return undefined;
  }

  public getAll(): readonly IService[] {
    return Array.from(this.services.values());
  }
}
