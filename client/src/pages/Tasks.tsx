import { useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodFormValidator } from "../lib/form";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Calendar, RotateCw, Play, CheckCircle } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import DataTable from "../components/table/DataTable";
import { api, ApiError } from "../lib/api";
import { demoTasks, useDemoMode } from "../lib/demo";
import {
  TaskFormSchema,
  TaskPriorityEnum,
  TaskStatusEnum,
} from "../lib/schemas";
import type { Task, TaskFormValues } from "../lib/schemas";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function TasksPage() {
  const isDemo = useDemoMode();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    if (isDemo) {
      setTasks(demoTasks);
      setLoading(false);
      return;
    }
    try {
      const response = await api.getTasks({ pageSize: 100 });
      setTasks(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, [isDemo]);

  const handleSubmit = async (values: TaskFormValues) => {
    if (isDemo) return;
    setError(null);
    try {
      const payload = {
        ...values,
        description: values.description?.trim() || null,
        dueDate: values.dueDate ? formatDate(values.dueDate) : null,
      };
      if (editing) {
        await api.updateTask(editing.id, payload);
      } else {
        await api.createTask(payload);
      }
      setEditing(null);
      await loadTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar tarefa.");
    }
  };

  const columns = useMemo<ColumnDef<Task>[]>(() => {
    const base: ColumnDef<Task>[] = [
      {
        accessorKey: "title",
        header: "Titulo",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">
              {row.original.title}
            </p>
            <p className="text-xs text-[rgb(var(--muted))]">
              {row.original.description ?? "Sem descricao"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const tone =
            status === "FEITO"
              ? "accent"
              : status === "EM_ANDAMENTO"
              ? "warning"
              : "muted";
          return <Badge tone={tone}>{status.replace("_", " ")}</Badge>;
        },
      },
      {
        accessorKey: "priority",
        header: "Prioridade",
        cell: ({ row }) => {
          const priority = row.original.priority;
          const tone = priority === "ALTA" ? "danger" : "muted";
          return <Badge tone={tone}>{priority}</Badge>;
        },
      },
      {
        accessorKey: "dueDate",
        header: "Entrega",
        cell: ({ row }) => (
          <span className="text-xs text-[rgb(var(--muted))]">
            {row.original.dueDate
              ? new Date(row.original.dueDate).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Sem prazo"}
          </span>
        ),
      },
    ];
    if (!isDemo) {
      base.push({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.status !== "FEITO" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  setError(null);
                  try {
                    const nextStatus = row.original.status === "A_FAZER" ? "EM_ANDAMENTO" : "FEITO";
                    await api.updateTask(row.original.id, {
                      title: row.original.title,
                      description: row.original.description,
                      status: nextStatus,
                      priority: row.original.priority,
                      dueDate: row.original.dueDate,
                    });
                    await loadTasks();
                  } catch (err) {
                    setError(
                      err instanceof ApiError
                        ? err.message
                        : "Erro ao atualizar status da tarefa."
                    );
                  }
                }}
                title={row.original.status === "A_FAZER" ? "Iniciar" : "Concluir"}
              >
                {row.original.status === "A_FAZER" ? <Play size={16} /> : <CheckCircle size={16} />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(row.original)}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setError(null);
                try {
                  await api.deleteTask(row.original.id);
                  await loadTasks();
                } catch (err) {
                  setError(
                    err instanceof ApiError
                      ? err.message
                      : "Erro ao excluir tarefa."
                  );
                }
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      });
    }
    return base;
  }, [isDemo]);

  const form = useForm({
    defaultValues: {
      title: editing?.title ?? "",
      description: editing?.description ?? "",
      status: editing?.status ?? "A_FAZER",
      priority: editing?.priority ?? "MEDIA",
      dueDate: formatDate(editing?.dueDate ?? null),
    },
    validatorAdapter: zodFormValidator<TaskFormValues>(),
    validators: {
      onSubmit: TaskFormSchema,
    },
    onSubmit: async ({ value }) => {
      await handleSubmit(value);
    },
  });

  useEffect(() => {
    form.reset({
      title: editing?.title ?? "",
      description: editing?.description ?? "",
      status: editing?.status ?? "A_FAZER",
      priority: editing?.priority ?? "MEDIA",
      dueDate: formatDate(editing?.dueDate ?? null),
    });
  }, [editing, form]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <Card className="h-fit">
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          {editing ? "Editar tarefa" : "Nova tarefa"}
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Organize o que precisa ser entregue.
        </p>
        {error ? (
          <div className="mt-4 rounded-2xl border border-[rgba(var(--danger),0.4)] bg-[rgba(var(--danger),0.08)] px-4 py-3 text-xs text-[rgb(var(--danger))]">
            {error}
          </div>
        ) : null}
        {isDemo ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent))]">
            Demo somente leitura
          </p>
        ) : null}
        <form
          key={editing?.id ?? "new"}
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="title">
            {(field) => (
              <label className="block text-sm text-[rgb(var(--muted))]">
                Titulo
                <Input
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Ex: Revisar backlog"
                  hasError={field.state.meta.errors.length > 0}
                  className="mt-2"
                  disabled={isDemo}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="mt-1 text-xs text-[rgb(var(--danger))]">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </label>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <label className="block text-sm text-[rgb(var(--muted))]">
                Descricao
                <Textarea
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Notas adicionais"
                  className="mt-2"
                  disabled={isDemo}
                />
              </label>
            )}
          </form.Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="status">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Status
                    <Select
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value as TaskFormValues["status"]
                        )
                      }
                      onBlur={field.handleBlur}
                      className="mt-2"
                      disabled={isDemo}
                    >
                    {TaskStatusEnum.options.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </Select>
                </label>
              )}
            </form.Field>
            <form.Field name="priority">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Prioridade
                    <Select
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value as TaskFormValues["priority"]
                        )
                      }
                      onBlur={field.handleBlur}
                      className="mt-2"
                      disabled={isDemo}
                    >
                    {TaskPriorityEnum.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
              )}
            </form.Field>
          </div>
          <form.Field name="dueDate">
            {(field) => (
              <label className="block text-sm text-[rgb(var(--muted))]">
                Data limite
                <div className="relative mt-2">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]"
                  />
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className="pl-10"
                    disabled={isDemo}
                  />
                </div>
              </label>
            )}
          </form.Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isDemo}>
              {form.state.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(null)}
                disabled={isDemo}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
              Lista de tarefas
            </h2>
            <p className="text-sm text-[rgb(var(--muted))]">
              Ordene, filtre e acompanhe seu progresso.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadTasks()}
            title="Atualizar"
          >
            <RotateCw size={16} />
          </Button>
        </div>
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={tasks}
            isLoading={loading}
            error={error}
            emptyTitle="Nenhuma tarefa cadastrada"
            emptyDescription="Crie sua primeira tarefa ao lado."
            searchPlaceholder="Buscar tarefas"
          />
        </div>
      </Card>
    </div>
  );
}
