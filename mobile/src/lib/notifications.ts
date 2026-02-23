import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * PASSO 1: CONFIGURAR O MANIPULADOR DE NOTIFICAÇÕES
 * 
 * Isso define como a aplicação deve se comportar quando recebe uma notificação.
 * handleNotification: chamado quando a notificação chega
 * handleSuccess: chamado quando a notificação é agendada com sucesso
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,       // Mostrar alerta visual
    shouldPlaySound: true,       // Reproduzir som
    shouldSetBadge: true,        // Mostrar badge no app
  }),
});

/**
 * PASSO 2: SOLICITAR PERMISSÕES
 * 
 * Antes de enviar notificações, precisamos da permissão do usuário
 * Isso é obrigatório no iOS e recomendado no Android
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Se ainda não foi pedida permissão, solicita agora
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Erro ao solicitar permissões de notificação:", error);
    return false;
  }
};

/**
 * PASSO 3: AGENDAR NOTIFICAÇÃO LOCAL
 * 
 * Esta função agenda uma notificação para ser exibida em uma data/hora específica
 * 
 * @param title - Título da notificação (ex: "Tarefa: Estudar React")
 * @param body - Corpo/descrição (ex: "Você tem uma tarefa vencendo hoje")
 * @param trigger - Quando exibir (data específica ou em X segundos)
 * @returns ID da notificação agendada
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput
) => {
  try {
    // Agendar a notificação com os dados fornecidos
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        // Adicionar ícone do app
        ...(Platform.OS === "android" && {
          icon: "favicon",
          smallIcon: "favicon",
          color: "#007AFF",
        }),
        // Dados extras que podem ser acessados quando o usuário clica
        data: {
          type: "reminder",
          timestamp: new Date().toISOString(),
        },
      },
      trigger,
    });

    console.log("Notificação agendada com ID:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("Erro ao agendar notificação:", error);
    return null;
  }
};

/**
 * PASSO 4: AGENDAR NOTIFICAÇÃO PARA UMA DATA ESPECÍFICA
 * 
 * Função auxiliar que agenda uma notificação para NO DIA LIMITE às 10:00 da manhã
 * Como o app trabalha apenas com datas (sem hora), sempre usa 10:00
 * 
 * @param title - Título da notificação
 * @param body - Descrição
 * @param dueDate - Data ISO (ex: "2026-02-22T10:00:00.000Z") ou data em string
 * @returns ID da notificação
 */
export const scheduleNotificationForDate = async (
  title: string,
  body: string,
  dueDate: string | null
) => {
  if (!dueDate) {
    console.log("Data não fornecida, notificação não agendada");
    return null;
  }

  try {
    // Parse da data - extrai apenas a parte da data (YYYY-MM-DD)
    const dueDateObj = new Date(dueDate);
    const now = new Date();

    // Se a data já passou, não agenda
    if (dueDateObj <= now) {
      console.log("Data já passou, notificação não agendada");
      return null;
    }

    // Cria uma nova data com o mesmo dia, mas às 10:00 da manhã
    const notificationTime = new Date(dueDateObj);
    notificationTime.setHours(10, 0, 0, 0); // Define para 10:00:00.000

    // Se a hora de notificação já passou hoje, não agenda
    if (notificationTime <= now) {
      console.log("Hora da notificação já passou para este dia");
      return null;
    }

    // Calcula quantos segundos faltam até a notificação
    const secondsUntilNotification = Math.floor(
      (notificationTime.getTime() - now.getTime()) / 1000
    );

    console.log(
      `Notificação agendada para: ${notificationTime.toLocaleString("pt-BR")} (em ${secondsUntilNotification}s)`
    );

    // Agenda para o dia limite às 10:00 da manhã
    return scheduleNotification(title, body, {
      seconds: secondsUntilNotification,
    });
  } catch (error) {
    console.error("Erro ao agendar notificação para data:", error);
    return null;
  }
};

/**
 * PASSO 5: CANCELAR UMA NOTIFICAÇÃO AGENDADA
 * 
 * Útil quando um item é deletado ou a data é alterada
 * 
 * @param notificationId - ID da notificação a cancelar
 */
export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log("Notificação cancelada:", notificationId);
  } catch (error) {
    console.error("Erro ao cancelar notificação:", error);
  }
};

/**
 * PASSO 6: OBTER TODAS AS NOTIFICAÇÕES AGENDADAS
 * 
 * Útil para debug ou para gerenciar notificações existentes
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Notificações agendadas:", notifications);
    return notifications;
  } catch (error) {
    console.error("Erro ao obter notificações agendadas:", error);
    return [];
  }
};

/**
 * PASSO 7: AGENDAR NOTIFICAÇÕES NO DIA LIMITE ÀS 10 DA MANHÃ
 * 
 * Agenda uma notificação ÚNICA para cada tarefa/meta no dia da data limite
 * A notificação aparece às 10:00 da manhã daquele dia específico
 * 
 * @param tasks - Lista de tarefas
 * @param goals - Lista de metas
 */
export const scheduleRemindersAt10AM = async (tasks: any[], goals: any[]) => {
  try {
    // Cancelar todas as notificações anteriores
    const scheduled = await getAllScheduledNotifications();
    for (const notification of scheduled) {
      await cancelNotification(notification.identifier);
    }

    const now = new Date();

    // Processar tarefas com data limite
    for (const task of tasks) {
      if (!task.dueDate || task.status === "FEITO") continue;

      const dueDate = new Date(task.dueDate);
      // Ignorar tarefas com data já passada
      if (dueDate <= now) continue;

      // Calcular segundos até o dia limite às 10:00 da manhã
      const notificationTime = new Date(dueDate);
      notificationTime.setHours(10, 0, 0, 0);
      
      const secondsUntil = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);
      
      // Apenas agendar se o tempo futuro for válido
      if (secondsUntil > 0) {
        await scheduleNotification(
          `📋 Tarefa: ${task.title}`,
          `Data limite: ${dueDate.toLocaleDateString("pt-BR")} - Prioridade: ${task.priority}`,
          {
            seconds: secondsUntil,
          }
        );
      }
    }

    // Processar metas ativas
    for (const goal of goals) {
      if (goal.status === "CONCLUIDA") continue;

      const weekStart = new Date(goal.weekStart);
      // Ignorar metas com data já passada
      if (weekStart <= now) continue;

      // Calcular segundos até o dia limite às 10:00 da manhã
      const notificationTime = new Date(weekStart);
      notificationTime.setHours(10, 0, 0, 0);
      
      const secondsUntil = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);
      
      // Apenas agendar se o tempo futuro for válido
      if (secondsUntil > 0) {
        const progress = Math.round((goal.currentValue / goal.targetValue) * 100);
        await scheduleNotification(
          `🎯 Meta: ${goal.title}`,
          `${goal.currentValue}/${goal.targetValue} ${goal.unit} (${progress}%) - Até ${weekStart.toLocaleDateString("pt-BR")}`,
          {
            seconds: secondsUntil,
          }
        );
      }
    }

    console.log("✅ Notificações agendadas para os dias limite às 10:00");
  } catch (error) {
    console.error("Erro ao agendar lembretes:", error);
  }
};
