import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Screen } from "../components/Screen";
import { api, ApiError } from "../lib/api";
import { AuthSchema, RegisterSchema } from "../lib/schemas";
import { useAuthStore } from "../store/authStore";
import { useTheme, withAlpha } from "../theme";

type Mode = "login" | "register";

export function AuthScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async () => {
    setError(null);
    const payload =
      mode === "login" ? { email, password } : { name, email, password };
    const schema = mode === "login" ? AuthSchema : RegisterSchema;
    const result = schema.safeParse(payload);
    if (!result.success) {
      setError(result.error.errors.map((item) => item.message).join("\n"));
      return;
    }

    setLoading(true);
    try {
      const response =
        mode === "login"
          ? await api.login(result.data)
          : await api.register(result.data);
      login(response.token, response.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel autenticar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={{ paddingTop: 28 }}>
      <View style={styles.header}>
        <Text style={[styles.brand, { color: colors.accent }]}>Flowboard</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Organize tarefas, habitos e metas em um unico painel.
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Visual leve, drag and drop e insights semanais para manter o foco.
        </Text>
        <View style={styles.bullets}>
          <Text style={[styles.bullet, { color: colors.muted }]}>
            - Layout personalizavel
          </Text>
          <Text style={[styles.bullet, { color: colors.muted }]}>
            - Modo escuro sincronizado
          </Text>
          <Text style={[styles.bullet, { color: colors.muted }]}>
            - Analises semanais instantaneas
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
          {mode === "login"
            ? "Acesse seu dashboard com seu e-mail."
            : "Configure seu perfil em segundos."}
        </Text>

        {error ? (
          <View
            style={[
              styles.errorBox,
              {
                borderColor: colors.danger,
                backgroundColor: withAlpha(colors.danger, 0.12),
              },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {mode === "register" ? (
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Nome"
              autoCapitalize="words"
            />
          ) : null}
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            secureTextEntry
          />
          <Button
            title={
              loading ? "Enviando..." : mode === "login" ? "Entrar" : "Criar conta"
            }
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            {mode === "login" ? "Ainda nao possui conta?" : "Ja possui conta?"}
          </Text>
          <Button
            title={mode === "login" ? "Criar agora" : "Entrar"}
            onPress={() =>
              setMode((current) => (current === "login" ? "register" : "login"))
            }
            variant="ghost"
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
  },
  brand: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  bullets: {
    marginTop: 12,
    gap: 4,
  },
  bullet: {
    fontSize: 12,
  },
  card: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    gap: 12,
    marginTop: 8,
  },
  errorBox: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
  },
  footer: {
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
  },
});

