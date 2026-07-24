import { registerCapability } from './CapabilityRegistrar.js';
import { ApplicationCapability } from './ApplicationCapability.js';

type IntentLauncherModule = { readonly launchApp: (packageName: string) => Promise<void> };

type ReactNativeExports = {
  readonly NativeModules: { readonly IntentLauncher?: IntentLauncherModule };
  readonly Platform: { readonly OS: string };
};

function getReactNative(): Promise<ReactNativeExports> {
  return import('react-native') as Promise<ReactNativeExports>;
}

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
    const { NativeModules, Platform } = await getReactNative();
    return Platform.OS === 'android' && NativeModules.IntentLauncher !== undefined;
  }

  public async execute(params: Readonly<Record<string, unknown>>): Promise<unknown> {
    const { NativeModules } = await getReactNative();
    const packageName = typeof params.packageName === 'string' ? params.packageName : undefined;

    if (packageName === undefined || packageName.trim() === '') {
      throw new Error('Parameter packageName is required.');
    }

    const intentLauncher = NativeModules.IntentLauncher;
    if (intentLauncher === undefined) {
      throw new Error('IntentLauncher native module is unavailable.');
    }

    await intentLauncher.launchApp(packageName);

    return { opened: packageName };
  }
}

export const openApplicationCapability = new OpenApplicationCapability();
