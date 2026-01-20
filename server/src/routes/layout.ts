import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { LayoutSchema } from "../lib/validation";

export async function layoutRoutes(app: FastifyInstance) {
  app.get("/layout", { preHandler: [app.authenticate] }, async (request) => {
    const existing = await prisma.dashboardLayout.findUnique({
      where: { userId: request.user.id },
    });
    if (!existing) {
      return { cards: ["summary", "tasks", "habits", "goals", "analytics"] };
    }
    let raw: unknown;
    try {
      raw = JSON.parse(existing.layoutJson);
    } catch {
      raw = null;
    }
    const parsed = LayoutSchema.safeParse(raw);
    if (!parsed.success) {
      return { cards: ["summary", "tasks", "habits", "goals", "analytics"] };
    }
    return parsed.data;
  });

  app.put("/layout", { preHandler: [app.authenticate] }, async (request) => {
    const payload = LayoutSchema.parse(request.body);
    const layout = await prisma.dashboardLayout.upsert({
      where: { userId: request.user.id },
      update: {
        layoutJson: JSON.stringify(payload),
      },
      create: {
        userId: request.user.id,
        layoutJson: JSON.stringify(payload),
      },
    });
    return LayoutSchema.parse(JSON.parse(layout.layoutJson));
  });
}
