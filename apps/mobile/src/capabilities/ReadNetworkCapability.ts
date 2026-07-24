import { isReactNativeRuntime, loadReactNativeRuntime } from '../platform/ReactNativeRuntime.js';
import { registerCapability } from './CapabilityRegistrar.js';
import { DeviceCapability } from './DeviceCapability.js';

export class ReadNetworkCapability extends DeviceCapability {
  public readonly id = 'read-network';
  public readonly name = 'Read Network';
  public readonly description = 'Reads the current network type and connectivity status.';
  public readonly permissions = ['android.permission.ACCESS_NETWORK_STATE'] as const;
  public readonly supportedPlatforms = ['android'] as const;
  public readonly categories: readonly import('./Capability.js').CapabilityCategory[] = ['device', 'network'];

  public constructor() {
    super();
    registerCapability(this);
  }

  public async isSupported(): Promise<boolean> {
    if (!isReactNativeRuntime()) {
      return false;
    }

    const { NativeModules, Platform } = await loadReactNativeRuntime();
    return Platform.OS === 'android' && NativeModules.NetworkModule !== undefined;
  }

  public async execute(): Promise<unknown> {
    const { NativeModules, Platform } = await loadReactNativeRuntime();

    if (Platform.OS !== 'android') {
      throw new Error('Network reading is supported only on Android.');
    }

    const networkModule = NativeModules.NetworkModule;

    if (networkModule === undefined) {
      throw new Error('NetworkModule native module is unavailable.');
    }

    const [networkType, connected] = await Promise.all([
      networkModule.getNetworkType(),
      networkModule.isConnected()
    ]);

    return { networkType, connected };
  }
}

export const readNetworkCapability = new ReadNetworkCapability();