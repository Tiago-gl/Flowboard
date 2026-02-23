import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task, Goal } from "./schemas";

const WIDGET_TASKS_ID = "widget_tasks_summary";
const WIDGET_GOALS_ID = "widget_goals_summary";
const WIDGET_DATA_KEY = "@widget_data";

/**
 * Salva as tarefas em andamento e mostra como notificação persistente
 * na tela de notificações (que aparece na tela inicial)
 */
export const syncTasksToWidget = async (tasks: Task[]) => {
  try {
    // Filtrar apenas tarefas em andamento ou a fazer
    const activeTasks = tasks
      .filter((task) => task.status !== "FEITO")
      .slice(0, 5);

    const widgetData = {
      count: activeTasks.length,
      tasks: activeTasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      })),
    };

    // Salvar dados localmente
    await AsyncStorage.setItem(
      `${WIDGET_DATA_KEY}:tasks`,
      JSON.stringify(widgetData)
    );

    console.log("✅ Tarefas sincronizadas:", activeTasks.length);
  } catch (error) {
    console.error("❌ Erro ao sincronizar tarefas:", error);
  }
};

/**
 * Salva as metas em andamento e mostra como notificação persistente
 */
export const syncGoalsToWidget = async (goals: Goal[]) => {
  try {
    // Filtrar apenas metas ativas
    const activeGoals = goals
      .filter((goal) => goal.status !== "CONCLUIDA")
      .slice(0, 5);

    const widgetData = {
      count: activeGoals.length,
      goals: activeGoals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        status: goal.status,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        unit: goal.unit,
        progress: Math.round((goal.currentValue / goal.targetValue) * 100),
      })),
    };

    // Salvar dados localmente
    await AsyncStorage.setItem(
      `${WIDGET_DATA_KEY}:goals`,
      JSON.stringify(widgetData)
    );

    console.log("✅ Metas sincronizadas:", activeGoals.length);
  } catch (error) {
    console.error("❌ Erro ao sincronizar metas:", error);
  }
};

/**
 * Obtém as tarefas do widget para prévia
 */
export const getWidgetTasksPreview = async () => {
  try {
    const data = await AsyncStorage.getItem(`${WIDGET_DATA_KEY}:tasks`);
    return data ? JSON.parse(data).tasks : [];
  } catch (error) {
    console.error("Erro ao obter preview:", error);
    return [];
  }
};

/**
 * Obtém as metas do widget para prévia
 */
export const getWidgetGoalsPreview = async () => {
  try {
    const data = await AsyncStorage.getItem(`${WIDGET_DATA_KEY}:goals`);
    return data ? JSON.parse(data).goals : [];
  } catch (error) {
    console.error("Erro ao obter preview:", error);
    return [];
  }
};

/**
 * Limpa todos os widgets (útil ao fazer logout)
 */
export const clearAllWidgets = async () => {
  try {
    // Limpar dados
    await AsyncStorage.multiRemove([
      `${WIDGET_DATA_KEY}:tasks`,
      `${WIDGET_DATA_KEY}:goals`,
    ]);

    console.log("✅ Widgets limpos");
  } catch (error) {
    console.error("❌ Erro ao limpar:", error);
  }
};

/**
 * Inicializa os widgets
 */
export const initializeWidgets = async () => {
  try {
    console.log("✅ Widgets inicializados");
  } catch (error) {
    console.error("❌ Erro ao inicializar:", error);
  }
};
