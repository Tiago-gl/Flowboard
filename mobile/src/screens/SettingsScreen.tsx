import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../theme";
import type { ThemeMode } from "../store/themeStore";

export function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { colors, mode, setMode } = useTheme();

  const modes: { key: ThemeMode; label: string }[] = [
    { key: "system", label: "Sistema" },
    { key: "light", label: "Claro" },
    { key: "dark", label: "Escuro" },
  ];

  return (
    <Screen>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Perfil</Text>
        <View style={styles.profile}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.name ?? "Usuario"}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.muted }]}>
            {user?.email ?? ""}
          </Text>
        </View>
      </Card>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Aparencia
        </Text>
        <View style={styles.modeRow}>
          {modes.map((item) => {
            const active = mode === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setMode(item.key)}
                style={[
                  styles.modeButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: active ? colors.accentSoft : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    { color: active ? colors.accent : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.modeHint, { color: colors.muted }]}>
          O modo Sistema acompanha o tema do seu celular automaticamente.
        </Text>
      </Card>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sessao</Text>
        <Button title="Sair" onPress={logout} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  profile: {
    gap: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileEmail: {
    fontSize: 13,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modeHint: {
    fontSize: 12,
  },
});

