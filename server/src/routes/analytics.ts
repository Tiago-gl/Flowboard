import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

const toKey = (date: Date) => date.toISOString().slice(0, 10);

export async function analyticsRoutes(app: FastifyInstance) {
  app.get(
    "/analytics/weekly",
    { preHandler: [app.authenticate] },
    async (request) => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      const [tasks, habitLogs] = await prisma.$transaction([
        prisma.task.findMany({
          where: {
            userId: request.user.id,
            completedAt: { gte: start, lte: end },
          },
        }),
        prisma.habitLog.findMany({
          where: {
            userId: request.user.id,
            date: { gte: start, lte: end },
          },
        }),
      ]);

      const taskMap = new Map<string, number>();
      const habitMap = new Map<string, number>();

      tasks.forEach((task) => {
        if (!task.completedAt) return;
        const key = toKey(task.completedAt);
        taskMap.set(key, (taskMap.get(key) ?? 0) + 1);
      });

      habitLogs.forEach((log) => {
        const key = toKey(log.date);
        habitMap.set(key, (habitMap.get(key) ?? 0) + log.count);
      });

      const days = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const key = toKey(date);
        return {
          date: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          tasksDone: taskMap.get(key) ?? 0,
          habitCount: habitMap.get(key) ?? 0,
        };
      });

      return { days };
    }
  );
}
