import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GripVertical, Sparkles } from "lucide-react";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../lib/api";
import { demoAnalytics, demoHabits, demoLayout, demoTasks, demoGoals, useDemoMode } from "../lib/demo";
import type { Goal, Habit, Task, WeeklyAnalytics } from "../lib/schemas";

const defaultCards = ["summary", "tasks", "habits", "goals", "analytics"];

type SortableCardProps = {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
};

function SortableCard({ id, children, disabled = false }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {!disabled ? (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[rgba(var(--bg),0.7)] px-2 py-1 text-xs text-[rgb(var(--muted))]">
          <GripVertical size={14} />
          Arraste
        </div>
      ) : null}
      <div {...attributes} {...listeners}>
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const isDemo = useDemoMode();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analytics, setAnalytics] = useState<WeeklyAnalytics | null>(null);
  const [cards, setCards] = useState<string[]>(defaultCards);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      if (isDemo) {
        setTasks(demoTasks.slice(0, 5));
        setHabits(demoHabits.slice(0, 5));
        setGoals(demoGoals.slice(0, 5));
        setAnalytics(demoAnalytics);
        setCards(demoLayout.cards);
        setLoading(false);
        return;
      }
      try {
        const [tasksData, habitsData, goalsData, analyticsData, layout] =
          await Promise.all([
            api.getTasks({ pageSize: 5 }),
            api.getHabits({ pageSize: 5 }),
            api.getGoals({ pageSize: 5 }),
            api.getWeeklyAnalytics(),
            api.getLayout().catch(() => ({ cards: defaultCards })),
          ]);
        if (!active) return;
        setTasks(tasksData.items);
        setHabits(habitsData.items);
        setGoals(goalsData.items);
        setAnalytics(analyticsData);
        if (layout?.cards?.length) {
          const filtered = layout.cards.filter((id) => defaultCards.includes(id));
          const missing = defaultCards.filter((id) => !filtered.includes(id));
          setCards([...filtered, ...missing]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isDemo]);

  const summary = useMemo(() => {
    const done = tasks.filter((task) => task.status === "DONE").length;
    const pending = tasks.filter((task) => task.status !== "DONE").length;
    return {
      done,
      pending,
      habits: habits.length,
      goals: goals.length,
    };
  }, [tasks, habits, goals]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    setCards((items) => {
      const oldIndex = items.indexOf(activeId);
      const newIndex = items.indexOf(overId);
      const next = arrayMove(items, oldIndex, newIndex);
      if (!isDemo) {
        void api.updateLayout({ cards: next }).catch(() => undefined);
      }
      return next;
    });
  };

  const cardContent: Record<string, React.ReactNode> = {
    summary: (
      <Card elevated>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))]">
              Panorama
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">
              Seu ritmo semanal
            </h2>
          </div>
          <div className="rounded-full bg-[rgba(var(--accent),0.12)] p-3 text-[rgb(var(--accent))]">
            <Sparkles size={20} />
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(var(--border),0.6)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
              Tarefas concluidas
            </p>
            <p className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">
              {summary.done}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border),0.6)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
              Tarefas pendentes
            </p>
            <p className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">
              {summary.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border),0.6)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
              Habitos ativos
            </p>
            <p className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">
              {summary.habits}
            </p>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border),0.6)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
              Metas semanais
            </p>
            <p className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">
              {summary.goals}
            </p>
          </div>
        </div>
      </Card>
    ),
    tasks: (
      <Card>
        <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
          Tarefas em foco
        </h3>
        <p className="text-sm text-[rgb(var(--muted))]">
          Priorize as entregas de hoje.
        </p>
        <div className="mt-4 space-y-3">
          {tasks.length === 0 ? (
            <EmptyState title="Sem tarefas" description="Crie sua primeira." />
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.6)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    {task.title}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted))]">
                    {task.status.replace("_", " ")}
                  </p>
                </div>
                <span className="text-xs text-[rgb(var(--muted))]">
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    ),
    habits: (
      <Card>
        <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
          Habitos consistentes
        </h3>
        <p className="text-sm text-[rgb(var(--muted))]">
          Ajuste seus rituais semanais.
        </p>
        <div className="mt-4 space-y-3">
          {habits.length === 0 ? (
            <EmptyState title="Sem habitos" description="Cadastre um habito." />
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.6)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    {habit.name}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted))]">
                    {habit.frequency}
                  </p>
                </div>
                <span className="text-xs text-[rgb(var(--muted))]">
                  {habit.targetPerWeek ? `${habit.targetPerWeek}x` : "Livre"}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    ),
    goals: (
      <Card>
        <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
          Metas da semana
        </h3>
        <p className="text-sm text-[rgb(var(--muted))]">
          Revise os objetivos em andamento.
        </p>
        <div className="mt-4 space-y-3">
          {goals.length === 0 ? (
            <EmptyState title="Sem metas" description="Crie uma meta." />
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-2xl border border-[rgba(var(--border),0.6)] px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    {goal.title}
                  </p>
                  <span className="text-xs text-[rgb(var(--muted))]">
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-[rgba(var(--border),0.5)]">
                  <div
                    className="h-2 rounded-full bg-[rgb(var(--accent))]"
                    style={{
                      width: `${Math.min(
                        100,
                        (goal.currentValue / goal.targetValue) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    ),
    analytics: (
      <Card elevated>
        <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
          Pulso da semana
        </h3>
        <p className="text-sm text-[rgb(var(--muted))]">
          Ritmo de tarefas concluidas e habitos.
        </p>
        <div className="mt-6 h-64">
          {analytics ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.days}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="rgb(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="rgb(var(--chart-2))"
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(var(--chart-2))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(var(--border),0.4)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "rgb(var(--muted))", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgb(var(--muted))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--surface))",
                    borderRadius: "12px",
                    borderColor: "rgba(var(--border),0.6)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tasksDone"
                  stroke="rgb(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
                <Area
                  type="monotone"
                  dataKey="habitCount"
                  stroke="rgb(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorHabits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="Sem dados analiticos"
              description="Registre atividades para liberar insights."
            />
          )}
        </div>
      </Card>
    ),
  };

  if (loading) {
    return (
      <Card className="text-center text-sm text-[rgb(var(--muted))]">
        Carregando dashboard...
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={isDemo ? undefined : handleDragEnd}
    >
      <SortableContext items={cards}>
        <div className="grid gap-6 lg:grid-cols-2">
          {cards.map((id) => (
            <SortableCard key={id} id={id} disabled={isDemo}>
              {cardContent[id]}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
