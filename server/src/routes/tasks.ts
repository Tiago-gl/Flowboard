import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { TaskInputSchema, TaskStatusEnum } from "../lib/validation";

const parseNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function taskRoutes(app: FastifyInstance) {
  app.get("/tasks", { preHandler: [app.authenticate] }, async (request) => {
    const query = request.query as {
      page?: string;
      pageSize?: string;
      status?: string;
      search?: string;
    };
    const page = Math.max(1, parseNumber(query.page, 1));
    const pageSize = Math.min(50, Math.max(1, parseNumber(query.pageSize, 10)));
    const status = query.status ? TaskStatusEnum.parse(query.status) : undefined;
    const search = query.search?.trim();

    const where = {
      userId: request.user.id,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total, page, pageSize };
  });

  app.post("/tasks", { preHandler: [app.authenticate] }, async (request) => {
    const payload = TaskInputSchema.parse(request.body);
    const isDone = payload.status === "DONE";
    const task = await prisma.task.create({
      data: {
        userId: request.user.id,
        title: payload.title,
        description: payload.description ?? null,
        status: payload.status,
        priority: payload.priority,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        completedAt: isDone ? new Date() : null,
      },
    });
    return task;
  });

  app.put("/tasks/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const payload = TaskInputSchema.parse(request.body);
    const existing = await prisma.task.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!existing) {
      reply.code(404);
      return { message: "Tarefa nao encontrada." };
    }
    const isDone = payload.status === "DONE";
    const task = await prisma.task.update({
      where: { id },
      data: {
        title: payload.title,
        description: payload.description ?? null,
        status: payload.status,
        priority: payload.priority,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        completedAt: isDone ? existing.completedAt ?? new Date() : null,
      },
    });
    return task;
  });

  app.delete(
    "/tasks/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.task.findFirst({
        where: { id, userId: request.user.id },
      });
      if (!existing) {
        reply.code(404);
        return { message: "Tarefa nao encontrada." };
      }
      await prisma.task.delete({ where: { id } });
      reply.code(204);
      return null;
    }
  );
}
