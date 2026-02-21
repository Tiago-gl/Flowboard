import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { DatePickerInput } from "../components/DatePickerInput";
import { Screen } from "../components/Screen";
import { api, ApiError } from "../lib/api";
import {
  TaskFormSchema,
  TaskPriorityEnum,
  TaskStatusEnum,
  type Task,
} from "../lib/schemas";
import { useTheme } from "../theme";

const STATUSES = TaskStatusEnum.options;
const PRIORITIES = TaskPriorityEnum.options;

const formatDateToBR = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateFromBR = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts[0].padStart(4, "0") + "-" + parts[1].padStart(2, "0") + "-" + parts[2].padStart(2, "0");
};

export function TasksScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("A_FAZER");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("MEDIA");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks({ pageSize: 50 });
      setItems(data.items);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel carregar tarefas.");
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
    const trimmedDate = dueDate.trim();
    const hasDate = trimmedDate.length > 0;
    const parsedDate = hasDate ? new Date(trimmedDate) : null;
    if (hasDate && Number.isNaN(parsedDate?.valueOf())) {
      setError("Informe uma data valida no formato YYYY-MM-DD.");
      return;
    }
    const formValues = {
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      status,
      priority,
      dueDate: hasDate ? trimmedDate : undefined,
    };
    const validation = TaskFormSchema.safeParse(formValues);
    if (!validation.success) {
      setError(validation.error.issues.map((item) => item.message).join("\n"));
      return;
    }
    const dateForPayload = hasDate ? formatDateFromBR(dueDate.trim()) : undefined;
    const parsedDateForPayload = dateForPayload ? new Date(dateForPayload) : null;
    const payload = {
      ...validation.data,
      dueDate: dateForPayload && parsedDateForPayload ? parsedDateForPayload.toISOString() : null,
    };
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateTask(editing.id, payload);
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const created = await api.createTask(payload);
        setItems((prev) => [created, ...prev]);
      }
      setTitle("");
      setDescription("");
      setDueDate("");
      setStatus("A_FAZER");
      setPriority("MEDIA");
      setEditing(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel salvar tarefa.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await api.deleteTask(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel excluir tarefa.");
      }
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {editing ? "Editar tarefa" : "Nova tarefa"}
        </Text>
        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}
        <View style={styles.form}>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Titulo"
          />
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Descricao (opcional)"
          />
          <DatePickerInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="Data limite"
          />
          <View style={styles.toggleGroup}>
            {STATUSES.map((value) => (
              <Pressable
                key={value}
                onPress={() => setStatus(value)}
                style={[
                  styles.toggle,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      status === value ? colors.accent : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: status === value ? colors.surface : colors.text },
                  ]}
                >
                  {value.replace("_", " ")}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.toggleGroup}>
            {PRIORITIES.map((value) => (
              <Pressable
                key={value}
                onPress={() => setPriority(value)}
                style={[
                  styles.toggle,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      priority === value ? colors.accent : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: priority === value ? colors.surface : colors.text },
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actionRow}>
            <Button
              title={saving ? "Salvando..." : editing ? "Salvar" : "Adicionar tarefa"}
              onPress={handleCreate}
              disabled={saving}
            />
            {editing ? (
              <Button
                title="Cancelar"
                onPress={() => {
                  setEditing(null);
                  setTitle("");
                  setDescription("");
                  setDueDate("");
                  setStatus("A_FAZER");
                  setPriority("MEDIA");
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
            Suas tarefas
          </Text>
          <Button title="Atualizar" onPress={load} variant="ghost" />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : items.length === 0 ? (
          <Text style={[styles.empty, { color: colors.muted }]}>
            Nenhuma tarefa cadastrada.
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
                    {item.title}
                  </Text>
                  <Text style={[styles.listMeta, { color: colors.muted }]}>
                    {item.status.replace("_", " ")} - {item.priority}
                    {item.dueDate ? " • " + formatDateToBR(item.dueDate.slice(0, 10)) : ""}
                  </Text>
                </View>
                <View style={styles.inlineActions}>
                  <Button
                    title="Editar"
                    onPress={() => {
                      setEditing(item);
                      setTitle(item.title);
                      setDescription(item.description ?? "");
                      setDueDate(item.dueDate ? formatDateToBR(item.dueDate.slice(0, 10)) : "");
                      setStatus(item.status);
                      setPriority(item.priority);
                    }}
                    variant="ghost"
                  />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  listInfo: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  listMeta: {
    fontSize: 12,
  },
  empty: {
  },
  inlineActions: {
    flexDirection: "row",
    gap: 8,
  },
});


