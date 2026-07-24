import { isReactNativeRuntime, loadReactNativeRuntime } from '../platform/ReactNativeRuntime.js';
import { registerCapability } from './CapabilityRegistrar.js';
import { ApplicationCapability } from './ApplicationCapability.js';

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
    if (!isReactNativeRuntime()) {
      return false;
    }

    const { NativeModules, Platform } = await loadReactNativeRuntime();
    return Platform.OS === 'android' && NativeModules.IntentLauncher?.launchSettings !== undefined;
  }

  public async execute(): Promise<unknown> {
    const { NativeModules, Platform } = await loadReactNativeRuntime();

    if (Platform.OS !== 'android') {
      throw new Error('Opening system settings is supported only on Android.');
    }

    const launchSettings = NativeModules.IntentLauncher?.launchSettings;

    if (launchSettings === undefined) {
      throw new Error('IntentLauncher native module is unavailable.');
    }

    await launchSettings();

    return { opened: 'settings' };
  }
}

export const openSettingsCapability = new OpenSettingsCapability();