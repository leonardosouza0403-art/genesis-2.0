import { isReactNativeRuntime, loadReactNativeRuntime } from '../platform/ReactNativeRuntime.js';
import { registerCapability } from './CapabilityRegistrar.js';
import { ApplicationCapability } from './ApplicationCapability.js';

export class OpenApplicationCapability extends ApplicationCapability {
  public readonly id = 'open-application';
  public readonly name = 'Open Application';
  public readonly description = 'Launches a native Android application by package name.';
  public readonly permissions = ['android.intent.launch'] as const;
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
    return Platform.OS === 'android' && NativeModules.IntentLauncher?.launchApp !== undefined;
  }

  public async execute(params: Readonly<Record<string, unknown>>): Promise<unknown> {
    const packageName = typeof params.packageName === 'string' ? params.packageName.trim() : '';

    if (packageName === '') {
      throw new Error('Parameter packageName is required.');
    }

    const { NativeModules, Platform } = await loadReactNativeRuntime();

    if (Platform.OS !== 'android') {
      throw new Error('Opening applications is supported only on Android.');
    }

    const launchApp = NativeModules.IntentLauncher?.launchApp;

    if (launchApp === undefined) {
      throw new Error('IntentLauncher native module is unavailable.');
    }

    await launchApp(packageName);

    return { opened: packageName };
  }
}

export const openApplicationCapability = new OpenApplicationCapability();