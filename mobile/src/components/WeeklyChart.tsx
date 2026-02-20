import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import type { WeeklyAnalytics } from "../lib/schemas";
import { useTheme } from "../theme";

type WeeklyChartProps = {
  data: WeeklyAnalytics;
  height?: number;
};

const buildPath = (points: { x: number; y: number }[]) => {
  if (!points.length) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");
};

export function WeeklyChart({ data, height = 220 }: WeeklyChartProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(260, Math.floor(windowWidth - 72));
  const padding = 16;

  const chartData = useMemo(() => {
    const labels = data.days.map((day) => day.date);
    const values = data.days.map((day) => Math.max(day.tasksDone, day.habitCount));
    const maxY = Math.max(1, ...values);
    const availableWidth = chartWidth - padding * 2;
    const availableHeight = height - padding * 2;

    const steps = Math.max(1, data.days.length - 1);

    const tasksPoints = data.days.map((day, index) => {
      const x = padding + (availableWidth / steps) * index;
      const y = height - padding - (day.tasksDone / maxY) * availableHeight;
      return { x, y };
    });

    const habitsPoints = data.days.map((day, index) => {
      const x = padding + (availableWidth / steps) * index;
      const y = height - padding - (day.habitCount / maxY) * availableHeight;
      return { x, y };
    });

    return {
      labels,
      tasksPath: buildPath(tasksPoints),
      habitsPath: buildPath(habitsPoints),
      grid: [0, 0.33, 0.66, 1].map((ratio) => ({
        y: padding + availableHeight * ratio,
      })),
    };
  }, [data, chartWidth, height]);

  return (
    <View style={styles.wrapper}>
      <Svg width={chartWidth} height={height}>
        {chartData.grid.map((line, index) => (
          <Line
            key={`grid-${index}`}
            x1={padding}
            x2={chartWidth - padding}
            y1={line.y}
            y2={line.y}
            stroke={colors.border}
            strokeDasharray="4 4"
          />
        ))}
        <Path
          d={chartData.tasksPath}
          stroke={colors.chart1}
          strokeWidth={2}
          fill="none"
        />
        <Path
          d={chartData.habitsPath}
          stroke={colors.chart2}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
      <View style={[styles.labels, { width: chartWidth }]}>
        {chartData.labels.map((label) => (
          <Text key={label} style={[styles.labelText, { color: colors.muted }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelText: {
    fontSize: 10,
  },
});
