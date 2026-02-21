import { useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { api } from "../lib/api";
import type { Goal, Habit, Task, WeeklyAnalytics } from "../lib/schemas";
import { useTheme } from "../theme";
import { WeeklyChart } from "../components/WeeklyChart";

const defaultCards = ["summary", "tasks", "habits", "goals", "analytics"];

export function DashboardScreen() {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analytics, setAnalytics] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<string[]>(defaultCards);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksData, habitsData, goalsData, analyticsData, layout] =
        await Promise.all([
          api.getTasks({ pageSize: 5 }),
          api.getHabits({ pageSize: 5 }),
          api.getGoals({ pageSize: 5 }),
          api.getWeeklyAnalytics(),
          api.getLayout().catch(() => ({ cards: defaultCards })),
        ]);
      setTasks(tasksData.items);
      setHabits(habitsData.items);
      setGoals(goalsData.items);
      setAnalytics(analyticsData);
      if (layout?.cards?.length) {
        const filtered = layout.cards.filter((id) =>
          defaultCards.includes(id)
        );
        const missing = defaultCards.filter((id) => !filtered.includes(id));
        setCards([...filtered, ...missing]);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const summary = useMemo(() => {
    const done = tasks.filter((task) => task.status === "FEITO").length;
    const pending = tasks.filter((task) => task.status !== "FEITO").length;
    return {
      done,
      pending,
      habits: habits.length,
      goals: goals.length,
    };
  }, [tasks, habits, goals]);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Carregando dashboard...
          </Text>
        </View>
      </Screen>
    );
  }

  const cardContent: Record<string, ReactNode> = {
    summary: (
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Panorama da semana
        </Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryItem, { borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Tarefas concluidas
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {summary.done}
            </Text>
          </View>
          <View style={[styles.summaryItem, { borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Tarefas pendentes
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {summary.pending}
            </Text>
          </View>
          <View style={[styles.summaryItem, { borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Habitos ativos
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {summary.habits}
            </Text>
          </View>
          <View style={[styles.summaryItem, { borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Metas semanais
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {summary.goals}
            </Text>
          </View>
        </View>
      </Card>
    ),
    tasks: (
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tarefas em foco
        </Text>
        <View style={styles.list}>
          {tasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Sem tarefas cadastradas.
            </Text>
          ) : (
            tasks.map((task) => (
              <View
                key={task.id}
                style={[styles.listItem, { borderColor: colors.border }]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {task.title}
                </Text>
                <Text style={[styles.listMeta, { color: colors.muted }]}>
                  {task.status.replace("_", " ")} - {task.priority}
                </Text>
              </View>
            ))
          )}
        </View>
      </Card>
    ),
    habits: (
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Habitos consistentes
        </Text>
        <View style={styles.list}>
          {habits.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Sem habitos cadastrados.
            </Text>
          ) : (
            habits.map((habit) => (
              <View
                key={habit.id}
                style={[styles.listItem, { borderColor: colors.border }]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {habit.name}
                </Text>
                <Text style={[styles.listMeta, { color: colors.muted }]}>
                  {habit.frequency} -{" "}
                  {habit.targetPerWeek ? `${habit.targetPerWeek}x` : "Livre"}
                </Text>
              </View>
            ))
          )}
        </View>
      </Card>
    ),
    goals: (
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Metas da semana
        </Text>
        <View style={styles.list}>
          {goals.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Sem metas cadastradas.
            </Text>
          ) : (
            goals.map((goal) => (
              <View
                key={goal.id}
                style={[styles.listItem, { borderColor: colors.border }]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {goal.title}
                </Text>
                <Text style={[styles.listMeta, { color: colors.muted }]}>
                  {goal.currentValue}/{goal.targetValue} {goal.unit}
                </Text>
              </View>
            ))
          )}
        </View>
      </Card>
    ),
    analytics: (
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Pulso da semana
        </Text>
        {analytics ? (
          <WeeklyChart data={analytics} height={180} />
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Sem dados de analytics.
          </Text>
        )}
      </Card>
    ),
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<string>) => (
    <ScaleDecorator>
      <Pressable onLongPress={drag} disabled={isActive}>
        <View style={styles.cardWrap}>
          <View
            style={[
              styles.dragBadge,
              { backgroundColor: colors.accentSoft, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.dragText, { color: colors.accent }]}>
              Arraste
            </Text>
          </View>
          {cardContent[item]}
        </View>
      </Pressable>
    </ScaleDecorator>
  );

  return (
    <Screen scroll={false} contentStyle={{ padding: 0 }}>
      <DraggableFlatList
        data={cards}
        keyExtractor={(item) => item}
        onDragEnd={({ data }) => {
          setCards(data);
          void api.updateLayout({ cards: data }).catch(() => undefined);
        }}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, gap: 16 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryItem: {
    flexBasis: "47%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  listMeta: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  cardWrap: {
    gap: 8,
  },
  dragBadge: {
    alignSelf: "flex-end",
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dragText: {
    fontSize: 10,
    fontWeight: "600",
  },
});


