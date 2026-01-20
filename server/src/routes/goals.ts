import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { GoalInputSchema } from "../lib/validation";

const parseNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function goalRoutes(app: FastifyInstance) {
  app.get("/goals", { preHandler: [app.authenticate] }, async (request) => {
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
      ...(search ? { title: { contains: search } } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.goal.findMany({
        where,
        orderBy: [{ weekStart: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.goal.count({ where }),
    ]);

    return { items, total, page, pageSize };
  });

  app.post("/goals", { preHandler: [app.authenticate] }, async (request) => {
    const payload = GoalInputSchema.parse(request.body);
    const goal = await prisma.goal.create({
      data: {
        userId: request.user.id,
        title: payload.title,
        targetValue: payload.targetValue,
        currentValue: payload.currentValue ?? 0,
        unit: payload.unit,
        weekStart: new Date(payload.weekStart),
        status: payload.status,
      },
    });
    return goal;
  });

  app.put("/goals/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const payload = GoalInputSchema.parse(request.body);
    const existing = await prisma.goal.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!existing) {
      reply.code(404);
      return { message: "Meta nao encontrada." };
    }
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        title: payload.title,
        targetValue: payload.targetValue,
        currentValue: payload.currentValue ?? 0,
        unit: payload.unit,
        weekStart: new Date(payload.weekStart),
        status: payload.status,
      },
    });
    return goal;
  });

  app.delete(
    "/goals/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.goal.findFirst({
        where: { id, userId: request.user.id },
      });
      if (!existing) {
        reply.code(404);
        return { message: "Meta nao encontrada." };
      }
      await prisma.goal.delete({ where: { id } });
      reply.code(204);
      return null;
    }
  );
}
