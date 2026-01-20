import { z } from "zod";
import { useAuthStore } from "../store/authStore";
import {
  AuthSchema,
  GoalSchema,
  HabitSchema,
  LayoutSchema,
  RegisterSchema,
  TaskSchema,
  UserSchema,
  WeeklyAnalyticsSchema,
} from "./schemas";

const resolvedHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";
const resolvedProtocol =
  typeof window !== "undefined" ? window.location.protocol : "http:";
const API_URL =
  import.meta.env.VITE_API_URL?.toString() ??
  `${resolvedProtocol}//${resolvedHost}:4000`;

const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  });

type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

type RequestOptions<T> = {
  method?: string;
  body?: unknown;
  schema?: z.ZodType<T>;
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(path: string, options: RequestOptions<T> = {}) => {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message ?? "Erro ao comunicar com a API.";
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  if (options.schema) {
    return options.schema.parse(data);
  }
  return data as T;
};

export const api = {
  async login(payload: z.infer<typeof AuthSchema>) {
    return request<{ token: string; user: z.infer<typeof UserSchema> }>(
      "/auth/login",
      {
        method: "POST",
        body: payload,
        schema: z.object({
          token: z.string().min(10),
          user: UserSchema,
        }),
      }
    );
  },
  async register(payload: z.infer<typeof RegisterSchema>) {
    return request<{ token: string; user: z.infer<typeof UserSchema> }>(
      "/auth/register",
      {
        method: "POST",
        body: payload,
        schema: z.object({
          token: z.string().min(10),
          user: UserSchema,
        }),
      }
    );
  },
  async getMe() {
    return request<z.infer<typeof UserSchema>>("/me", { schema: UserSchema });
  },
  async getTasks(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.pageSize) query.set("pageSize", params.pageSize.toString());
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    return request<PaginatedResponse<z.infer<typeof TaskSchema>>>(
      `/tasks?${query.toString()}`,
      {
        schema: PaginatedSchema(TaskSchema),
      }
    );
  },
  async createTask(payload: unknown) {
    return request<z.infer<typeof TaskSchema>>("/tasks", {
      method: "POST",
      body: payload,
      schema: TaskSchema,
    });
  },
  async updateTask(id: string, payload: unknown) {
    return request<z.infer<typeof TaskSchema>>(`/tasks/${id}`, {
      method: "PUT",
      body: payload,
      schema: TaskSchema,
    });
  },
  async deleteTask(id: string) {
    return request(`/tasks/${id}`, { method: "DELETE" });
  },
  async getHabits(params: { page?: number; pageSize?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.pageSize) query.set("pageSize", params.pageSize.toString());
    if (params.search) query.set("search", params.search);
    return request<PaginatedResponse<z.infer<typeof HabitSchema>>>(
      `/habits?${query.toString()}`,
      {
        schema: PaginatedSchema(HabitSchema),
      }
    );
  },
  async createHabit(payload: unknown) {
    return request<z.infer<typeof HabitSchema>>("/habits", {
      method: "POST",
      body: payload,
      schema: HabitSchema,
    });
  },
  async updateHabit(id: string, payload: unknown) {
    return request<z.infer<typeof HabitSchema>>(`/habits/${id}`, {
      method: "PUT",
      body: payload,
      schema: HabitSchema,
    });
  },
  async deleteHabit(id: string) {
    return request(`/habits/${id}`, { method: "DELETE" });
  },
  async logHabit(habitId: string, payload: { date: string; count?: number }) {
    return request(`/habits/${habitId}/logs`, {
      method: "POST",
      body: payload,
      schema: z.object({
        id: z.string().uuid(),
        habitId: z.string().uuid(),
        date: z.string().datetime(),
        count: z.number().int().positive(),
      }),
    });
  },
  async getGoals(params: { page?: number; pageSize?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.pageSize) query.set("pageSize", params.pageSize.toString());
    if (params.search) query.set("search", params.search);
    return request<PaginatedResponse<z.infer<typeof GoalSchema>>>(
      `/goals?${query.toString()}`,
      {
        schema: PaginatedSchema(GoalSchema),
      }
    );
  },
  async createGoal(payload: unknown) {
    return request<z.infer<typeof GoalSchema>>("/goals", {
      method: "POST",
      body: payload,
      schema: GoalSchema,
    });
  },
  async updateGoal(id: string, payload: unknown) {
    return request<z.infer<typeof GoalSchema>>(`/goals/${id}`, {
      method: "PUT",
      body: payload,
      schema: GoalSchema,
    });
  },
  async deleteGoal(id: string) {
    return request(`/goals/${id}`, { method: "DELETE" });
  },
  async getLayout() {
    return request<z.infer<typeof LayoutSchema>>("/layout", {
      schema: LayoutSchema,
    });
  },
  async updateLayout(payload: unknown) {
    return request<z.infer<typeof LayoutSchema>>("/layout", {
      method: "PUT",
      body: payload,
      schema: LayoutSchema,
    });
  },
  async getWeeklyAnalytics() {
    return request<z.infer<typeof WeeklyAnalyticsSchema>>("/analytics/weekly", {
      schema: WeeklyAnalyticsSchema,
    });
  },
};

export { ApiError };
