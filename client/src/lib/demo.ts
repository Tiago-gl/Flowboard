import { useLocation } from "react-router-dom";
import type { Goal, Habit, LayoutValues, Task, User, WeeklyAnalytics } from "./schemas";

const toIso = (date: Date) => date.toISOString();

const now = new Date();
const daysAgo = (amount: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - amount);
  return d;
};

const weekLabels = Array.from({ length: 7 }, (_, index) => {
  const date = daysAgo(6 - index);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
});

export const demoUser: User = {
  id: "3f1e5f0b-7f7b-4b6e-9c8d-5d2b0ad9a222",
  name: "Marina Alves",
  email: "marina.demo@flowboard.app",
  createdAt: toIso(daysAgo(45)),
};

export const demoTasks: Task[] = [
  {
    id: "4a7f1a6c-3c3f-4b37-8c3f-7d9b7a1c2b01",
    title: "Revisar backlog prioritario",
    description: "Separar o que entra na sprint de fevereiro.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: toIso(daysAgo(-1)),
    completedAt: null,
    createdAt: toIso(daysAgo(4)),
    updatedAt: toIso(daysAgo(1)),
  },
  {
    id: "0a2b81b8-85cf-4a9b-9a4b-7f5e0f3f7b11",
    title: "Finalizar pagina de portfolio",
    description: "Ajustar cases e alinhar CTA final.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: toIso(daysAgo(2)),
    completedAt: null,
    createdAt: toIso(daysAgo(3)),
    updatedAt: toIso(daysAgo(2)),
  },
  {
    id: "7a8d8c3a-4f8e-4e26-9e45-8b1d3b3f1c90",
    title: "Enviar proposta comercial",
    description: "Cliente Studio Orbit.",
    status: "DONE",
    priority: "MEDIUM",
    dueDate: toIso(daysAgo(5)),
    completedAt: toIso(daysAgo(4)),
    createdAt: toIso(daysAgo(8)),
    updatedAt: toIso(daysAgo(4)),
  },
  {
    id: "b99e2c8a-3aa3-4c41-8d2b-6f7f5a3b2c13",
    title: "Preparar rotina de estudos",
    description: "Planejar blocos de 90 minutos.",
    status: "TODO",
    priority: "LOW",
    dueDate: null,
    completedAt: null,
    createdAt: toIso(daysAgo(6)),
    updatedAt: toIso(daysAgo(6)),
  },
  {
    id: "f4d9d2b1-2d88-4e84-9f5c-4e0d8b7a2c44",
    title: "Alinhar comunicacao do produto",
    description: "Revisar tom de voz e landing.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: toIso(daysAgo(3)),
    completedAt: null,
    createdAt: toIso(daysAgo(7)),
    updatedAt: toIso(daysAgo(1)),
  },
];

export const demoHabits: Habit[] = [
  {
    id: "9f4e7b1a-8d8d-4b0e-9b8a-9c6f3f4d2a10",
    name: "Caminhada matinal",
    frequency: "DAILY",
    targetPerWeek: 5,
    createdAt: toIso(daysAgo(30)),
    updatedAt: toIso(daysAgo(1)),
  },
  {
    id: "c1d7b9e2-9b5d-4b1e-8b2c-5f1a3b9c8d55",
    name: "Leitura tecnica",
    frequency: "WEEKLY",
    targetPerWeek: 3,
    createdAt: toIso(daysAgo(28)),
    updatedAt: toIso(daysAgo(2)),
  },
  {
    id: "5a4c2d1e-7b9c-4e1f-8a5d-2f3c4b1a9d66",
    name: "Alongamento",
    frequency: "DAILY",
    targetPerWeek: 6,
    createdAt: toIso(daysAgo(26)),
    updatedAt: toIso(daysAgo(1)),
  },
];

export const demoGoals: Goal[] = [
  {
    id: "1e7d9c3b-4c9a-4f8d-8b2a-7f5d4c3b2a10",
    title: "20 horas de estudo",
    targetValue: 20,
    currentValue: 12,
    unit: "h",
    weekStart: toIso(daysAgo(5)),
    status: "ACTIVE",
    createdAt: toIso(daysAgo(10)),
    updatedAt: toIso(daysAgo(1)),
  },
  {
    id: "2b8c7d6e-5f4a-4c3b-9d2a-1c0b9a8e7f66",
    title: "4 entregas finais",
    targetValue: 4,
    currentValue: 4,
    unit: "entregas",
    weekStart: toIso(daysAgo(12)),
    status: "COMPLETED",
    createdAt: toIso(daysAgo(16)),
    updatedAt: toIso(daysAgo(3)),
  },
];

export const demoAnalytics: WeeklyAnalytics = {
  days: weekLabels.map((label, index) => ({
    date: label,
    tasksDone: [1, 2, 0, 3, 2, 1, 2][index],
    habitCount: [2, 3, 4, 3, 5, 4, 6][index],
  })),
};

export const demoLayout: LayoutValues = {
  cards: ["summary", "tasks", "habits", "goals", "analytics"],
};

export const useDemoMode = () => {
  const { pathname } = useLocation();
  return pathname.startsWith("/demo");
};
