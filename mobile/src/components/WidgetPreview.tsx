import { View, Text, StyleSheet } from "react-native";

interface WidgetTaskItemProps {
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    border: string;
  };
}

export function WidgetTaskItem({
  title,
  status,
  priority,
  dueDate,
  colors,
}: WidgetTaskItemProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "ALTA":
        return "#EF4444";
      case "MEDIA":
        return "#F59E0B";
      case "BAIXA":
        return "#10B981";
      default:
        return colors.muted;
    }
  };

  return (
    <View
      style={[
        styles.taskItem,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.taskHeader}>
        <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(priority) },
          ]}
        >
          <Text style={styles.priorityText}>{priority.charAt(0)}</Text>
        </View>
      </View>
      <Text style={[styles.taskMeta, { color: colors.muted }]} numberOfLines={1}>
        {status.replace("_", " ")}
        {dueDate ? ` • ${dueDate}` : ""}
      </Text>
    </View>
  );
}

interface WidgetGoalItemProps {
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    border: string;
  };
}

export function WidgetGoalItem({
  title,
  currentValue,
  targetValue,
  unit,
  progress,
  colors,
}: WidgetGoalItemProps) {
  return (
    <View
      style={[
        styles.goalItem,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <Text style={[styles.goalTitle, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.goalProgress}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.border,
              overflow: "hidden",
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.goalStats, { color: colors.muted }]}>
          {currentValue}/{targetValue} {unit}
        </Text>
      </View>
    </View>
  );
}

export function WidgetEmpty({ colors }: { colors: any }) {
  return (
    <View
      style={[
        styles.emptyContainer,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        Nenhuma tarefa ou meta em andamento
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 4,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  taskMeta: {
    fontSize: 11,
  },

  goalItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  goalProgress: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  goalStats: {
    fontSize: 11,
  },

  emptyContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
  },
});
