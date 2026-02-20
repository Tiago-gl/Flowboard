import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { api, ApiError } from "../lib/api";
import type { WeeklyAnalytics } from "../lib/schemas";
import { useTheme } from "../theme";
import { WeeklyChart } from "../components/WeeklyChart";

export function AnalyticsScreen() {
  const { colors } = useTheme();
  const [data, setData] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getWeeklyAnalytics();
      setData(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Nao foi possivel carregar analytics.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Screen>
      <Card>
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Analytics da semana
          </Text>
          <Button title="Atualizar" onPress={load} variant="ghost" />
        </View>
        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : data ? (
          <View style={styles.chartWrap}>
            <WeeklyChart data={data} />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.chart1 }]}
                />
                <Text style={[styles.legendText, { color: colors.muted }]}>
                  Tarefas concluidas
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.chart2 }]}
                />
                <Text style={[styles.legendText, { color: colors.muted }]}>
                  Habitos
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={[styles.empty, { color: colors.muted }]}>
            Sem dados de analytics.
          </Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    gap: 12,
  },
  listItem: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  error: {
    fontSize: 13,
    marginBottom: 8,
  },
  empty: {
    fontSize: 13,
  },
  chartWrap: {
    marginTop: 12,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendText: {
    fontSize: 12,
  },
});

