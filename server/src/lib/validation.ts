import { z } from "zod";

// Helper para parsing de data no formato DD-MM-YYYY
const parseBRDate = (dateStr: string): Date => {
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateStr)) {
    throw new Error(`Data deve estar no formato DD-MM-YYYY, recebido: ${dateStr}`);
  }
  
  const [day, month, year] = dateStr.split('-').map(Number);
  
  if (month < 1 || month > 12) {
    throw new Error(`Mês inválido: ${month}`);
  }
  
  if (day < 1 || day > 31) {
    throw new Error(`Dia inválido: ${day}`);
  }
  
  const date = new Date(year, month - 1, day);
  
  // Validar se a data é válida (ex: 31 de fevereiro não é válido)
  if (date.getDate() !== day) {
    throw new Error(`Data inválida: ${dateStr}`);
  }
  
  return date;
};

const brDateSchema = z.string().transform((val, ctx) => {
  try {
    return parseBRDate(val);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : "Data inválida",
    });
    return z.NEVER;
  }
});

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = AuthSchema.extend({
  name: z.string().min(2),
});

export const TaskStatusEnum = z.enum(["A_FAZER", "EM_ANDAMENTO", "FEITO"]);
export const TaskPriorityEnum = z.enum(["BAIXA", "MEDIA", "ALTA"]);

export const TaskInputSchema = z.object({
  title: z.string().min(2),
  description: z.string().max(500).nullable().optional(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: brDateSchema.nullable().optional(),
});

export const HabitFrequencyEnum = z.enum(["DIARIA", "SEMANAL"]);

export const HabitInputSchema = z.object({
  name: z.string().min(2),
  frequency: HabitFrequencyEnum,
  targetPerWeek: z.number().int().positive().nullable().optional(),
});

export const HabitLogSchema = z.object({
  date: brDateSchema,
  count: z.number().int().positive().optional(),
});

export const GoalStatusEnum = z.enum(["ATIVA", "CONCLUIDA"]);

export const GoalInputSchema = z.object({
  title: z.string().min(2),
  targetValue: z.number().int().positive(),
  currentValue: z.number().int().nonnegative().optional(),
  unit: z.string().min(1),
  weekStart: brDateSchema,
  status: GoalStatusEnum,
});

export const LayoutSchema = z.object({
  cards: z.array(z.string().min(1)),
});
