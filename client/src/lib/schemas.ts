import { z } from "zod";

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const HabitFrequencyEnum = z.enum(["DAILY", "WEEKLY"]);
export const GoalStatusEnum = z.enum(["ACTIVE", "COMPLETED"]);

const DateTimeString = z.string().datetime();

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: DateTimeString,
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: DateTimeString.nullable().optional(),
  completedAt: DateTimeString.nullable().optional(),
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
});

export const TaskFormSchema = z.object({
  title: z.string().min(2, "Informe um titulo de pelo menos 2 caracteres."),
  description: z.string().max(500).optional(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: z.string().optional(),
});

export const HabitSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  frequency: HabitFrequencyEnum,
  targetPerWeek: z.number().int().positive().nullable().optional(),
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
});

export const HabitFormSchema = z.object({
  name: z.string().min(2, "Informe um nome de habito."),
  frequency: HabitFrequencyEnum,
  targetPerWeek: z
    .number()
    .int()
    .positive()
    .optional()
    .or(z.literal(0)),
});

export const GoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  targetValue: z.number().int().positive(),
  currentValue: z.number().int().nonnegative(),
  unit: z.string().min(1),
  weekStart: DateTimeString,
  status: GoalStatusEnum,
  createdAt: DateTimeString,
  updatedAt: DateTimeString,
});

export const GoalFormSchema = z.object({
  title: z.string().min(2, "Defina uma meta clara."),
  targetValue: z.number().int().positive(),
  currentValue: z.number().int().nonnegative().optional(),
  unit: z.string().min(1),
  weekStart: z.string().min(1),
  status: GoalStatusEnum,
});

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = AuthSchema.extend({
  name: z.string().min(2),
});

export const LayoutSchema = z.object({
  cards: z.array(z.string().min(1)),
});

export const WeeklyAnalyticsSchema = z.object({
  days: z.array(
    z.object({
      date: z.string().min(1),
      tasksDone: z.number().int().nonnegative(),
      habitCount: z.number().int().nonnegative(),
    })
  ),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskFormValues = z.infer<typeof TaskFormSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type HabitFormValues = z.infer<typeof HabitFormSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type GoalFormValues = z.infer<typeof GoalFormSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthValues = z.infer<typeof AuthSchema>;
export type RegisterValues = z.infer<typeof RegisterSchema>;
export type LayoutValues = z.infer<typeof LayoutSchema>;
export type WeeklyAnalytics = z.infer<typeof WeeklyAnalyticsSchema>;
