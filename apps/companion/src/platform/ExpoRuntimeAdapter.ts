import { Platform } from "react-native";
import Constants from "expo-constants";
import type { RuntimeAdapter } from "@genesis/platform";

export class ExpoRuntimeAdapter implements RuntimeAdapter {
  public readonly platform = Platform.OS;

  public readonly version =
    Constants.expoConfig?.version ?? "unknown";
}