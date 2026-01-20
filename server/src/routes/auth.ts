import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AuthSchema, RegisterSchema } from "../lib/validation";

const serializeUser = (user: { id: string; name: string; email: string; createdAt: Date }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const payload = RegisterSchema.parse(request.body);
    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      reply.code(409);
      return { message: "Email ja cadastrado." };
    }
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
      },
    });
    const token = app.jwt.sign({ id: user.id, email: user.email });
    return { token, user: serializeUser(user) };
  });

  app.post("/auth/login", async (request, reply) => {
    const payload = AuthSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      reply.code(401);
      return { message: "Credenciais invalidas." };
    }
    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) {
      reply.code(401);
      return { message: "Credenciais invalidas." };
    }
    const token = app.jwt.sign({ id: user.id, email: user.email });
    return { token, user: serializeUser(user) };
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });
    if (!user) {
      return { message: "Usuario nao encontrado." };
    }
    return serializeUser(user);
  });
}
