export type IntentLauncherModule = {
  readonly launchApp?: (packageName: string) => Promise<void>;
  readonly launchSettings?: () => Promise<void>;
};

export type BatteryModule = {
  readonly getBatteryLevel: () => Promise<number>;
};

export type DeviceInfoModule = {
  readonly getDeviceInfo: () => Promise<Readonly<Record<string, unknown>>>;
};

export type NetworkModule = {
  readonly getNetworkType: () => Promise<string>;
  readonly isConnected: () => Promise<boolean>;
};

export type ReactNativeRuntime = {
  readonly Platform: {
    readonly OS: string;
  };
  readonly NativeModules: {
    readonly IntentLauncher?: IntentLauncherModule;
    readonly BatteryModule?: BatteryModule;
    readonly DeviceInfoModule?: DeviceInfoModule;
    readonly NetworkModule?: NetworkModule;
  };
  readonly Linking: {
    readonly canOpenURL: (url: string) => Promise<boolean>;
    readonly openURL: (url: string) => Promise<void>;
  };
};

export function isReactNativeRuntime(): boolean {
  const runtime = globalThis as {
    readonly navigator?: {
      readonly product?: string;
    };
  };

  return runtime.navigator?.product === 'ReactNative';
}

export async function loadReactNativeRuntime(): Promise<ReactNativeRuntime> {
  if (!isReactNativeRuntime()) {
    throw new Error('React Native runtime is unavailable in the current environment.');
  }

  return import('react-native') as Promise<ReactNativeRuntime>;
}