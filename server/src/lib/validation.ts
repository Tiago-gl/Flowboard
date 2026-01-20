import { z } from "zod";

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = AuthSchema.extend({
  name: z.string().min(2),
});

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const TaskInputSchema = z.object({
  title: z.string().min(2),
  description: z.string().max(500).nullable().optional(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: z.string().datetime().nullable().optional(),
});

export const HabitFrequencyEnum = z.enum(["DAILY", "WEEKLY"]);

export const HabitInputSchema = z.object({
  name: z.string().min(2),
  frequency: HabitFrequencyEnum,
  targetPerWeek: z.number().int().positive().nullable().optional(),
});

export const HabitLogSchema = z.object({
  date: z.string().datetime(),
  count: z.number().int().positive().optional(),
});

export const GoalStatusEnum = z.enum(["ACTIVE", "COMPLETED"]);

export const GoalInputSchema = z.object({
  title: z.string().min(2),
  targetValue: z.number().int().positive(),
  currentValue: z.number().int().nonnegative().optional(),
  unit: z.string().min(1),
  weekStart: z.string().datetime(),
  status: GoalStatusEnum,
});

export const LayoutSchema = z.object({
  cards: z.array(z.string().min(1)),
});
