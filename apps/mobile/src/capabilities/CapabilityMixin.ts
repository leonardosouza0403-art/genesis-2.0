export function createCapability<T extends new (...args: any[]) => any>(ctor: T): T {
  return ctor;
}
