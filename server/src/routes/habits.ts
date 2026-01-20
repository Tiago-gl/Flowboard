import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { HabitInputSchema, HabitLogSchema } from "../lib/validation";

const parseNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function habitRoutes(app: FastifyInstance) {
  app.get("/habits", { preHandler: [app.authenticate] }, async (request) => {
    const query = request.query as {
      page?: string;
      pageSize?: string;
      search?: string;
    };
    const page = Math.max(1, parseNumber(query.page, 1));
    const pageSize = Math.min(50, Math.max(1, parseNumber(query.pageSize, 10)));
    const search = query.search?.trim();

    const where = {
      userId: request.user.id,
      ...(search ? { name: { contains: search } } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.habit.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.habit.count({ where }),
    ]);

    return { items, total, page, pageSize };
  });

  app.post("/habits", { preHandler: [app.authenticate] }, async (request) => {
    const payload = HabitInputSchema.parse(request.body);
    const habit = await prisma.habit.create({
      data: {
        userId: request.user.id,
        name: payload.name,
        frequency: payload.frequency,
        targetPerWeek: payload.targetPerWeek ?? null,
      },
    });
    return habit;
  });

  app.put("/habits/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const payload = HabitInputSchema.parse(request.body);
    const existing = await prisma.habit.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!existing) {
      reply.code(404);
      return { message: "Habito nao encontrado." };
    }
    const habit = await prisma.habit.update({
      where: { id },
      data: {
        name: payload.name,
        frequency: payload.frequency,
        targetPerWeek: payload.targetPerWeek ?? null,
      },
    });
    return habit;
  });

  app.post(
    "/habits/:id/logs",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const payload = HabitLogSchema.parse(request.body);
      const habit = await prisma.habit.findFirst({
        where: { id, userId: request.user.id },
      });
      if (!habit) {
        reply.code(404);
        return { message: "Habito nao encontrado." };
      }
      const log = await prisma.habitLog.upsert({
        where: {
          habitId_date: {
            habitId: id,
            date: new Date(payload.date),
          },
        },
        update: {
          count: payload.count ?? 1,
        },
        create: {
          habitId: id,
          userId: request.user.id,
          date: new Date(payload.date),
          count: payload.count ?? 1,
        },
      });
      return log;
    }
  );

  app.delete(
    "/habits/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.habit.findFirst({
        where: { id, userId: request.user.id },
      });
      if (!existing) {
        reply.code(404);
        return { message: "Habito nao encontrado." };
      }
      await prisma.habit.delete({ where: { id } });
      reply.code(204);
      return null;
    }
  );
}
