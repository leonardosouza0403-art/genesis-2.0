import { isReactNativeRuntime, loadReactNativeRuntime } from '../platform/ReactNativeRuntime.js';
import { registerCapability } from './CapabilityRegistrar.js';
import { ApplicationCapability } from './ApplicationCapability.js';

export class OpenUrlCapability extends ApplicationCapability {
  public readonly id = 'open-url';
  public readonly name = 'Open URL';
  public readonly description = 'Opens a URL using the native system URL handler.';
  public readonly permissions = ['android.permission.INTERNET'] as const;
  public readonly supportedPlatforms = ['android', 'ios'] as const;
  public readonly categories: readonly import('./Capability.js').CapabilityCategory[] = ['application'];

  public constructor() {
    super();
    registerCapability(this);
  }

  public async isSupported(): Promise<boolean> {
    return isReactNativeRuntime();
  }

  public async execute(params: Readonly<Record<string, unknown>>): Promise<unknown> {
    const url = typeof params.url === 'string' ? params.url.trim() : '';

    if (url === '') {
      throw new Error('Parameter url is required.');
    }

    const { Linking } = await loadReactNativeRuntime();
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      throw new Error(`URL '${url}' is not supported.`);
    }

    await Linking.openURL(url);

    return { opened: url };
  }
}

export const openUrlCapability = new OpenUrlCapability();