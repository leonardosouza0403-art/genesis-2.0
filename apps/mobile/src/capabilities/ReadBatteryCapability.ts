import { registerCapability } from './CapabilityRegistrar.js';
import { DeviceCapability } from './DeviceCapability.js';
import { Platform } from 'react-native';
import { NativeModules } from 'react-native';

const { BatteryModule } = NativeModules as { readonly BatteryModule?: { getBatteryLevel: () => Promise<number> } };

export class ReadBatteryCapability extends DeviceCapability {
  public readonly id = 'read-battery';
  public readonly name = 'Read Battery';
  public readonly description = 'Reads the current battery level from the device.';
  public readonly permissions = ['android.permission.BATTERY_STATS'] as const;
  public readonly supportedPlatforms = ['android'] as const;
  public readonly categories: readonly import('./Capability.js').CapabilityCategory[] = ['device', 'health'];

  public constructor() {
    super();
    registerCapability(this);
  }

  public async isSupported(): Promise<boolean> {
    return Platform.OS === 'android' && BatteryModule !== undefined;
  }

  public async execute(): Promise<unknown> {
    if (BatteryModule === undefined) {
      throw new Error('BatteryModule native module is unavailable.');
    }

    const batteryLevel = await BatteryModule.getBatteryLevel();

    return { batteryLevel };
  }
}

export const readBatteryCapability = new ReadBatteryCapability();
