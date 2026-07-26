import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ReactNativeGenesisEngine,
  type NativeGenesisSnapshot
} from "@genesis/mobile/native";

import {
  ExpoRuntimeAdapter,
  ExpoStorageAdapter
} from "@/platform";

function formatUptime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function StatusRow({
  label,
  value
}: {
  readonly label: string;
  readonly value: string | number;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function GenesisHomeScreen() {
  const [snapshot, setSnapshot] =
    useState<NativeGenesisSnapshot | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function boot(): Promise<void> {
      try {
        const engine = await ReactNativeGenesisEngine.initialize({
          storage: new ExpoStorageAdapter(),
          runtime: new ExpoRuntimeAdapter()
        });

        if (!active) {
          return;
        }

        setSnapshot(engine.snapshot());

        timer = setInterval(() => {
          if (active) {
            setSnapshot(engine.snapshot());
          }
        }, 1000);
      } catch (bootError) {
        if (active) {
          setError(
            bootError instanceof Error
              ? bootError.message
              : "Falha desconhecida ao iniciar o GENESIS."
          );
        }
      }
    }

    void boot();

    return () => {
      active = false;

      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, []);

  if (error !== null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.brand}>GENESIS 2.0</Text>
          <Text style={styles.error}>FALHA NO BOOT</Text>
          <Text style={styles.message}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (snapshot === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.brand}>GENESIS 2.0</Text>
          <ActivityIndicator
            size="large"
            color="#20E070"
            style={styles.loader}
          />
          <Text style={styles.message}>
            Inicializando engine...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>GENESIS 2.0</Text>

        <View style={styles.onlineContainer}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>ONLINE</Text>
        </View>

        <Text style={styles.greeting}>
          Bom dia, Senhor Leonardo.
        </Text>

        <View style={styles.panel}>
          <StatusRow label="Engine" value={snapshot.engineStatus} />
          <StatusRow label="Memória" value={snapshot.memoryStatus} />
          <StatusRow label="Sessão" value={snapshot.sessionStatus} />
          <StatusRow label="Plataforma" value={snapshot.platform} />
          <StatusRow label="Boots" value={snapshot.bootCount} />
          <StatusRow
            label="Capabilities"
            value={snapshot.capabilities.length}
          />
          <StatusRow label="Versão" value={snapshot.version} />
          <StatusRow
            label="Uptime"
            value={formatUptime(snapshot.uptimeMilliseconds)}
          />
        </View>

        <Text style={styles.message}>
          Identidade e sessão persistentes carregadas.
        </Text>

        <Text style={styles.ready}>Estou pronto.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05070A"
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 2
  },
  loader: {
    marginTop: 32
  },
  onlineContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  onlineDot: {
    backgroundColor: "#20E070",
    borderRadius: 6,
    height: 12,
    width: 12
  },
  onlineText: {
    color: "#20E070",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.4
  },
  greeting: {
    color: "#DCE6F0",
    fontSize: 20,
    marginTop: 36
  },
  panel: {
    backgroundColor: "#0D1218",
    borderColor: "#1D2A36",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 28,
    padding: 20
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#17202A",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13
  },
  label: {
    color: "#8FA2B5",
    fontSize: 15
  },
  value: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  message: {
    color: "#8FA2B5",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 28
  },
  ready: {
    color: "#20E070",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12
  },
  error: {
    color: "#FF6464",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24
  }
});