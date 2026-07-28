import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import {
  GenesisOS,
  type GenesisOSSnapshot
} from "@genesis/mobile/os";

import {
  GenesisShell,
  type GenesisShellSnapshot
} from "@genesis/mobile/shell";

import {
  ExpoRuntimeAdapter,
  ExpoStorageAdapter
} from "@/platform";

type ChatRole = "user" | "assistant" | "system";

interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: string;
}

function createMessage(
  role: ChatRole,
  content: string
): ChatMessage {
  return {
    id: [
      role,
      Date.now(),
      Math.random().toString(36).slice(2)
    ].join("-"),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function getStatusText(
  osSnapshot: GenesisOSSnapshot | null,
  shellSnapshot: GenesisShellSnapshot | null
): string {
  if (osSnapshot === null || shellSnapshot === null) {
    return "INICIALIZANDO";
  }

  if (
    osSnapshot.status === "online" &&
    shellSnapshot.status === "ready"
  ) {
    return "ONLINE";
  }

  if (
    osSnapshot.status === "failed" ||
    shellSnapshot.status === "failed"
  ) {
    return "FALHA";
  }

  return shellSnapshot.status.toUpperCase();
}

export default function GenesisHomeScreen() {
  const listReference =
    useRef<FlatList<ChatMessage> | null>(null);

  const [os] = useState(
    () =>
      new GenesisOS({
        storage: new ExpoStorageAdapter(),
        runtime: new ExpoRuntimeAdapter()
      })
  );

  const shell = useMemo(
    () => new GenesisShell(os),
    [os]
  );

  const [osSnapshot, setOsSnapshot] =
    useState<GenesisOSSnapshot | null>(null);

  const [shellSnapshot, setShellSnapshot] =
    useState<GenesisShellSnapshot | null>(null);

  const [messages, setMessages] =
    useState<readonly ChatMessage[]>([]);

  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [bootError, setBootError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function initialize(): Promise<void> {
      try {
        const initializedShell =
          await shell.start();

        if (!active) {
          return;
        }

        setShellSnapshot(initializedShell);
        setOsSnapshot(os.snapshot());

        if (initializedShell.status !== "ready") {
          throw new Error(
            initializedShell.error ??
              "O Genesis Shell não ficou pronto."
          );
        }

        setMessages([
          createMessage(
            "assistant",
            [
              "Olá, Senhor Leonardo.",
              "GENESIS 2.0 está online.",
              "Kernel, cérebro, memória, conhecimento e agente foram inicializados.",
              "Como posso ajudar?"
            ].join("\n")
          )
        ]);

        timer = setInterval(() => {
          if (!active) {
            return;
          }

          setOsSnapshot(os.snapshot());
          setShellSnapshot(shell.snapshot());
        }, 1000);
      } catch (error) {
        if (!active) {
          return;
        }

        setBootError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    }

    void initialize();

    return () => {
      active = false;

      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, [os, shell]);

  async function sendMessage(): Promise<void> {
    const normalizedInput = input.trim();

    if (
      normalizedInput.length === 0 ||
      processing ||
      shellSnapshot?.status !== "ready"
    ) {
      return;
    }

    const userMessage =
      createMessage("user", normalizedInput);

    setInput("");
    setProcessing(true);
    setMessages((current) => [
      ...current,
      userMessage
    ]);

    try {
      const response = await shell.execute(
        "genesis-main-conversation",
        normalizedInput
      );

      const assistantMessage = createMessage(
        "assistant",
        response.success
          ? response.output
          : response.error ??
              "Não foi possível processar o comando."
      );

      setMessages((current) => [
        ...current,
        assistantMessage
      ]);

      setShellSnapshot(shell.snapshot());
      setOsSnapshot(os.snapshot());
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage(
          "system",
          error instanceof Error
            ? error.message
            : String(error)
        )
      ]);
    } finally {
      setProcessing(false);

      setTimeout(() => {
        listReference.current?.scrollToEnd({
          animated: true
        });
      }, 100);
    }
  }

  const status =
    getStatusText(osSnapshot, shellSnapshot);

  if (
    osSnapshot === null ||
    shellSnapshot === null
  ) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.bootContainer}>
          <Text style={styles.brand}>GENESIS 2.0</Text>

          <View style={styles.bootOrb}>
            <ActivityIndicator
              size="large"
              color="#21E878"
            />
          </View>

          <Text style={styles.bootTitle}>
            INICIALIZANDO SISTEMA
          </Text>

          <Text style={styles.bootMessage}>
            Carregando Kernel, Brain, AI, memória e agentes...
          </Text>

          {bootError !== null && (
            <Text style={styles.error}>
              {bootError}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              GENESIS 2.0
            </Text>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  status === "ONLINE"
                    ? styles.statusOnline
                    : styles.statusBusy
                ]}
              />

              <Text style={styles.statusText}>
                {status}
              </Text>
            </View>
          </View>

          <View style={styles.systemCard}>
            <Text style={styles.systemCardValue}>
              {osSnapshot.kernel?.engine
                ?.capabilities.length ?? 0}
            </Text>

            <Text style={styles.systemCardLabel}>
              CAPACIDADES
            </Text>
          </View>
        </View>

        <View style={styles.runtimeBar}>
          <Text style={styles.runtimeText}>
            KERNEL {osSnapshot.kernel?.status ?? "offline"}
          </Text>

          <Text style={styles.runtimeText}>
            SHELL {shellSnapshot.status}
          </Text>

          <Text style={styles.runtimeText}>
            COMANDOS {shellSnapshot.commandCount}
          </Text>
        </View>

        <FlatList
          ref={listReference}
          data={messages}
          keyExtractor={(message) => message.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => {
            listReference.current?.scrollToEnd({
              animated: true
            });
          }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user"
                  ? styles.userBubble
                  : item.role === "assistant"
                    ? styles.assistantBubble
                    : styles.systemBubble
              ]}
            >
              <Text style={styles.messageRole}>
                {item.role === "user"
                  ? "SENHOR LEONARDO"
                  : item.role === "assistant"
                    ? "GENESIS"
                    : "SISTEMA"}
              </Text>

              <Text style={styles.messageContent}>
                {item.content}
              </Text>
            </View>
          )}
          ListFooterComponent={
            processing ? (
              <View
                style={[
                  styles.messageBubble,
                  styles.assistantBubble
                ]}
              >
                <Text style={styles.messageRole}>
                  GENESIS
                </Text>

                <View style={styles.processingRow}>
                  <ActivityIndicator
                    size="small"
                    color="#21E878"
                  />

                  <Text style={styles.processingText}>
                    Processando...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            value={input}
            onChangeText={setInput}
            editable={
              !processing &&
              shellSnapshot.status === "ready"
            }
            multiline
            placeholder="Digite um comando para o GENESIS..."
            placeholderTextColor="#617080"
            style={styles.input}
            onSubmitEditing={() => {
              void sendMessage();
            }}
          />

          <Pressable
            accessibilityRole="button"
            disabled={
              processing ||
              input.trim().length === 0 ||
              shellSnapshot.status !== "ready"
            }
            onPress={() => {
              void sendMessage();
            }}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              (
                processing ||
                input.trim().length === 0
              ) &&
                styles.sendButtonDisabled
            ]}
          >
            <Text style={styles.sendButtonText}>
              ENVIAR
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#040609"
  },
  keyboardContainer: {
    flex: 1
  },
  bootContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 28
  },
  bootOrb: {
    alignItems: "center",
    borderColor: "#173D2A",
    borderRadius: 70,
    borderWidth: 1,
    height: 140,
    justifyContent: "center",
    marginTop: 40,
    width: 140
  },
  bootTitle: {
    color: "#21E878",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: 32
  },
  bootMessage: {
    color: "#8090A0",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    textAlign: "center"
  },
  header: {
    alignItems: "center",
    borderBottomColor: "#141C24",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 2
  },
  statusContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 6
  },
  statusDot: {
    borderRadius: 5,
    height: 10,
    marginRight: 7,
    width: 10
  },
  statusOnline: {
    backgroundColor: "#21E878"
  },
  statusBusy: {
    backgroundColor: "#F4C542"
  },
  statusText: {
    color: "#21E878",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.3
  },
  systemCard: {
    alignItems: "flex-end"
  },
  systemCardValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800"
  },
  systemCardLabel: {
    color: "#708090",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1
  },
  runtimeBar: {
    borderBottomColor: "#141C24",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  runtimeText: {
    color: "#607080",
    fontSize: 9,
    fontWeight: "700"
  },
  messageList: {
    padding: 16,
    paddingBottom: 30
  },
  messageBubble: {
    borderRadius: 16,
    marginBottom: 14,
    maxWidth: "88%",
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#183425",
    borderColor: "#24563A",
    borderWidth: 1
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#0D1319",
    borderColor: "#1C2935",
    borderWidth: 1
  },
  systemBubble: {
    alignSelf: "center",
    backgroundColor: "#301B1B",
    borderColor: "#5C2B2B",
    borderWidth: 1
  },
  messageRole: {
    color: "#21E878",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 7
  },
  messageContent: {
    color: "#E8EEF4",
    fontSize: 15,
    lineHeight: 22
  },
  processingRow: {
    alignItems: "center",
    flexDirection: "row"
  },
  processingText: {
    color: "#8090A0",
    fontSize: 14,
    marginLeft: 10
  },
  inputArea: {
    alignItems: "flex-end",
    backgroundColor: "#080C10",
    borderTopColor: "#17212A",
    borderTopWidth: 1,
    flexDirection: "row",
    padding: 12
  },
  input: {
    backgroundColor: "#111820",
    borderColor: "#25323E",
    borderRadius: 16,
    borderWidth: 1,
    color: "#FFFFFF",
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 13
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "#21E878",
    borderRadius: 14,
    justifyContent: "center",
    marginLeft: 10,
    minHeight: 50,
    paddingHorizontal: 18
  },
  sendButtonPressed: {
    opacity: 0.8
  },
  sendButtonDisabled: {
    opacity: 0.35
  },
  sendButtonText: {
    color: "#041008",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  error: {
    color: "#FF6666",
    fontSize: 14,
    marginTop: 18,
    textAlign: "center"
  }
});