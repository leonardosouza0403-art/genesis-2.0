import { registerCapability } from './CapabilityRegistrar.js';
import { DeviceCapability } from './DeviceCapability.js';
import { Platform } from 'react-native';
import { NativeModules } from 'react-native';

const { NetworkModule } = NativeModules as { readonly NetworkModule?: { getNetworkType: () => Promise<string>; isConnected: () => Promise<boolean> } };

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
    return Platform.OS === 'android' && NetworkModule !== undefined;
  }

  public async execute(): Promise<unknown> {
    if (NetworkModule === undefined) {
      throw new Error('NetworkModule native module is unavailable.');
    }

    const networkType = await NetworkModule.getNetworkType();
    const connected = await NetworkModule.isConnected();

    return { networkType, connected };
  }
}

export const readNetworkCapability = new ReadNetworkCapability();
