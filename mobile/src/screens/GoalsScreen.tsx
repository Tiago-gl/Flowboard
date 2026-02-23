import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { DatePickerInput } from "../components/DatePickerInput";
import { Screen } from "../components/Screen";
import { api, ApiError } from "../lib/api";
import { GoalFormSchema, GoalStatusEnum, type Goal } from "../lib/schemas";
import { useTheme } from "../theme";
import { syncGoalsToWidget } from "../lib/widgets";
import { scheduleRemindersAt10AM } from "../lib/notifications";
import { useErrorHandler } from "../hooks";

const STATUSES = GoalStatusEnum.options;

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

export function GoalsScreen() {
  const { colors } = useTheme();
  const { error, setError, handleError, clearError } = useErrorHandler();
  
  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [unit, setUnit] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ATIVA");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const load = useCallback(async (pageNum: number = 1, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true);
      clearError();
    }
    try {
      const data = await api.getGoals({ pageSize: PAGE_SIZE, page: pageNum });
      const goalsList = pageNum === 1 ? data.items : [];
      setItems((prev) => isLoadMore ? [...prev, ...data.items] : data.items);
      if (pageNum === 1) {
        setPage(1);
        // Agendar notificações diárias às 10 da manhã apenas na primeira página
        await scheduleRemindersAt10AM([], goalsList);
      }
      // Sincronizar com widget
      await syncGoalsToWidget(data.items);
    } catch (err) {
      handleError(err);
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      }
    }
  }, [clearError, handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    clearError();
    const parsedTarget = Number(targetValue);
    const parsedCurrent = currentValue ? Number(currentValue) : undefined;
    const trimmedWeek = weekStart.trim();
    const parsedWeek = trimmedWeek ? new Date(trimmedWeek) : new Date();
    if (trimmedWeek && Number.isNaN(parsedWeek.valueOf())) {
      setError("Informe uma data valida no formato YYYY-MM-DD.");
      return;
    }
    const dateForPayload = formatDateFromBR(trimmedWeek);
    const parsedWeekForPayload = dateForPayload ? new Date(dateForPayload) : new Date();
    const payload = {
      title: title.trim(),
      targetValue: parsedTarget,
      currentValue: parsedCurrent,
      unit: unit.trim(),
      weekStart: parsedWeekForPayload.toISOString(),
      status,
    };
    const validation = GoalFormSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues.map((item) => item.message).join("\n"));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateGoal(editing.id, payload);
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        // Sincronizar com widget
        const updatedItems = items.map((item) =>
          item.id === updated.id ? updated : item
        );
        await syncGoalsToWidget(updatedItems);
      } else {
        const created = await api.createGoal(payload);
        setItems((prev) => [created, ...prev]);
        // Sincronizar com widget
        await syncGoalsToWidget([created, ...items]);
      }
      setTitle("");
      setTargetValue("");
      setCurrentValue("");
      setUnit("");
      setWeekStart("");
      setStatus("ATIVA");
      setEditing(null);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }, [title, targetValue, currentValue, unit, weekStart, status, editing, items, clearError, handleError]);

  const handleDelete = useCallback((id: string, goalTitle: string) => {
    Alert.alert(
      "Deletar meta",
      `Tem certeza que deseja deletar "${goalTitle}"?\nEsta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            setLoadingId(id);
            clearError();
            try {
              await api.deleteGoal(id);
              const updatedItems = items.filter((item) => item.id !== id);
              setItems(updatedItems);
              // Sincronizar com widget
              await syncGoalsToWidget(updatedItems);
            } catch (err) {
              handleError(err);
            } finally {
              setLoadingId(null);
            }
          },
        },
      ]
    );
  }, [items, clearError, handleError]);

  return (
    <Screen>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {editing ? "Editar meta" : "Nova meta"}
        </Text>
        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}
        <View style={styles.form}>
          <Input value={title} onChangeText={setTitle} placeholder="Titulo" />
          <Input
            value={targetValue}
            onChangeText={setTargetValue}
            placeholder="Valor alvo"
            keyboardType="numeric"
          />
          <Input
            value={currentValue}
            onChangeText={setCurrentValue}
            placeholder="Valor atual (opcional)"
            keyboardType="numeric"
          />
          <Input value={unit} onChangeText={setUnit} placeholder="Unidade" />
          <DatePickerInput
            value={weekStart}
            onChangeText={setWeekStart}
            placeholder="Semana"
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
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actionRow}>
            <Button
              title={saving ? "Salvando..." : editing ? "Salvar" : "Adicionar meta"}
              onPress={handleCreate}
              disabled={saving}
            />
            {editing ? (
              <Button
                title="Cancelar"
                onPress={() => {
                  setEditing(null);
                  setTitle("");
                  setTargetValue("");
                  setCurrentValue("");
                  setUnit("");
                  setWeekStart("");
                  setStatus("ATIVA");
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
            Suas metas
          </Text>
          <IconButton icon="refresh" onPress={load} variant="ghost" size="md" />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : items.length === 0 ? (
          <Text style={[styles.empty, { color: colors.muted }]}>
            Nenhuma meta cadastrada.
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
                    {item.currentValue}/{item.targetValue} {item.unit} - {item.status} • {formatDateToBR(item.weekStart.slice(0, 10))}
                  </Text>
                </View>
                <View style={styles.inlineActions}>
                  <IconButton
                    icon="add"
                    onPress={async () => {
                      try {
                        setLoadingId(item.id);
                        const newValue = item.currentValue + 1;
                        await api.updateGoal(item.id, {
                          title: item.title,
                          targetValue: item.targetValue,
                          currentValue: newValue,
                          unit: item.unit,
                          weekStart: item.weekStart,
                          status: newValue >= item.targetValue ? "CONCLUIDA" : item.status,
                        });
                        await load();
                      } catch (err) {
                        handleError(err);
                      } finally {
                        setLoadingId(null);
                      }
                    }}
                    variant="primary"
                    size="md"
                  />
                  <IconButton
                    icon="pencil"
                    onPress={() => {
                      setEditing(item);
                      setTitle(item.title);
                      setTargetValue(String(item.targetValue));
                      setCurrentValue(String(item.currentValue));
                      setUnit(item.unit);
                      setWeekStart(item.weekStart.slice(0, 10));
                      setStatus(item.status);
                    }}
                    variant="ghost"
                    size="md"
                  />
                  <IconButton
                    icon="trash"
                    onPress={() => handleDelete(item.id, item.title)}
                    disabled={loadingId === item.id}
                    variant="ghost"
                    size="md"
                  />
                </View>
              </View>
            ))}
            {items.length >= PAGE_SIZE && (
              <Button
                title={loading ? "Carregando..." : "Carregar mais"}
                onPress={() => void load(page + 1, true)}
                disabled={loading}
              />
            )}
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


