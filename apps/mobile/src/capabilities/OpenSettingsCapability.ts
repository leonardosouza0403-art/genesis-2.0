import { registerCapability } from './CapabilityRegistrar.js';
import { ApplicationCapability } from './ApplicationCapability.js';
import { NativeModules, Platform } from 'react-native';

const { IntentLauncher } = NativeModules as { readonly IntentLauncher?: { launchSettings: () => Promise<void> } };

export class OpenSettingsCapability extends ApplicationCapability {
  public readonly id = 'open-settings';
  public readonly name = 'Open Settings';
  public readonly description = 'Opens the Android system settings screen.';
  public readonly permissions = ['android.intent.settings'] as const;
  public readonly supportedPlatforms = ['android'] as const;
  public readonly categories: readonly import('./Capability.js').CapabilityCategory[] = ['application'];

  public constructor() {
    super();
    registerCapability(this);
  }

  public async isSupported(): Promise<boolean> {
    return Platform.OS === 'android' && IntentLauncher !== undefined;
  }

  public async execute(): Promise<unknown> {
    if (IntentLauncher === undefined) {
      throw new Error('IntentLauncher native module is unavailable.');
    }

    await IntentLauncher.launchSettings();

    return { opened: 'settings' };
  }
}

export const openSettingsCapability = new OpenSettingsCapability();
