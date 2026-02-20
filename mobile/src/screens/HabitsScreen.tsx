import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Screen } from "../components/Screen";
import { api, ApiError } from "../lib/api";
import { HabitFormSchema, HabitFrequencyEnum, type Habit } from "../lib/schemas";
import { useTheme } from "../theme";

const FREQUENCIES = HabitFrequencyEnum.options;

export function HabitsScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("DIARIA");
  const [targetPerWeek, setTargetPerWeek] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHabits({ pageSize: 50 });
      setItems(data.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel carregar habitos.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async () => {
    setError(null);
    const trimmedTarget = targetPerWeek.trim();
    const parsedTarget = trimmedTarget ? Number(trimmedTarget) : undefined;
    if (parsedTarget !== undefined && Number.isNaN(parsedTarget)) {
      setError("Informe um numero valido para a meta semanal.");
      return;
    }
    const payload = {
      name: name.trim(),
      frequency,
      targetPerWeek: parsedTarget,
    };
    const validation = HabitFormSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.errors.map((item) => item.message).join("\n"));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateHabit(editing.id, payload);
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const created = await api.createHabit(payload);
        setItems((prev) => [created, ...prev]);
      }
      setName("");
      setFrequency("DIARIA");
      setTargetPerWeek("");
      setEditing(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel salvar habito.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await api.deleteHabit(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel excluir habito.");
      }
    }
  };

  const handleLog = async (id: string) => {
    setError(null);
    try {
      await api.logHabit(id, { date: new Date().toISOString(), count: 1 });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel registrar habito.");
      }
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {editing ? "Editar habito" : "Novo habito"}
        </Text>
        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}
        <View style={styles.form}>
          <Input value={name} onChangeText={setName} placeholder="Nome" />
          <Input
            value={targetPerWeek}
            onChangeText={setTargetPerWeek}
            placeholder="Meta semanal (opcional)"
            keyboardType="numeric"
          />
          <View style={styles.toggleGroup}>
            {FREQUENCIES.map((value) => (
              <Pressable
                key={value}
                onPress={() => setFrequency(value)}
                style={[
                  styles.toggle,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      frequency === value ? colors.accent : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: frequency === value ? colors.surface : colors.text },
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actionRow}>
            <Button
              title={saving ? "Salvando..." : editing ? "Salvar" : "Adicionar habito"}
              onPress={handleCreate}
              disabled={saving}
            />
            {editing ? (
              <Button
                title="Cancelar"
                onPress={() => {
                  setEditing(null);
                  setName("");
                  setFrequency("DIARIA");
                  setTargetPerWeek("");
                  setError(null);
                }}
                variant="ghost"
              />
            ) : null}
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Seus habitos
          </Text>
          <Button title="Atualizar" onPress={load} variant="ghost" />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : items.length === 0 ? (
          <Text style={[styles.empty, { color: colors.muted }]}>
            Nenhum habito cadastrado.
          </Text>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View
                key={item.id}
                style={[styles.listItem, { borderColor: colors.border }]}
              >
                <View style={styles.listInfo}>
                  <Text style={[styles.listTitle, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.listMeta, { color: colors.muted }]}>
                    {item.frequency} -{" "}
                    {item.targetPerWeek ? `${item.targetPerWeek}x` : "Livre"}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Button
                    title="Editar"
                    onPress={() => {
                      setEditing(item);
                      setName(item.name);
                      setFrequency(item.frequency);
                      setTargetPerWeek(
                        item.targetPerWeek ? String(item.targetPerWeek) : ""
                      );
                    }}
                    variant="ghost"
                  />
                  <Button title="Feito" onPress={() => void handleLog(item.id)} />
                  <Button
                    title="Excluir"
                    onPress={() => void handleDelete(item.id)}
                    variant="ghost"
                  />
                </View>
              </View>
            ))}
          </View>
        )}
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
  error: {
    fontSize: 13,
    marginBottom: 8,
  },
  form: {
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toggleGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toggle: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  toggleText: {
    fontSize: 12,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  list: {
    gap: 12,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  listInfo: {
    gap: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  listMeta: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  empty: {
  },
});


