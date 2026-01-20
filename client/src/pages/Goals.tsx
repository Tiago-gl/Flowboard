import { useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodFormValidator } from "../lib/form";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import DataTable from "../components/table/DataTable";
import { api, ApiError } from "../lib/api";
import { GoalFormSchema, GoalStatusEnum } from "../lib/schemas";
import type { Goal, GoalFormValues } from "../lib/schemas";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Goal | null>(null);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getGoals({ pageSize: 100 });
      setGoals(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGoals();
  }, []);

  const handleSubmit = async (values: GoalFormValues) => {
    const payload = {
      ...values,
      targetValue: Number(values.targetValue),
      currentValue: Number(values.currentValue ?? 0),
      weekStart: new Date(values.weekStart).toISOString(),
    };
    if (editing) {
      await api.updateGoal(editing.id, payload);
    } else {
      await api.createGoal(payload);
    }
    setEditing(null);
    await loadGoals();
  };

  const columns = useMemo<ColumnDef<Goal>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Meta",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">
              {row.original.title}
            </p>
            <p className="text-xs text-[rgb(var(--muted))]">
              Semana de {new Date(row.original.weekStart).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge tone={row.original.status === "COMPLETED" ? "accent" : "warning"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "progress",
        header: "Progresso",
        cell: ({ row }) => (
          <span className="text-xs text-[rgb(var(--muted))]">
            {row.original.currentValue}/{row.original.targetValue} {row.original.unit}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
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
                await api.deleteGoal(row.original.id);
                await loadGoals();
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const form = useForm({
    defaultValues: {
      title: editing?.title ?? "",
      targetValue: editing?.targetValue ?? 1,
      currentValue: editing?.currentValue ?? 0,
      unit: editing?.unit ?? "h",
      weekStart: formatDate(editing?.weekStart ?? null),
      status: editing?.status ?? "ACTIVE",
    },
    validatorAdapter: zodFormValidator<GoalFormValues>(),
    validators: {
      onSubmit: GoalFormSchema,
    },
    onSubmit: async ({ value }) => {
      await handleSubmit(value);
    },
  });

  useEffect(() => {
    form.reset({
      title: editing?.title ?? "",
      targetValue: editing?.targetValue ?? 1,
      currentValue: editing?.currentValue ?? 0,
      unit: editing?.unit ?? "h",
      weekStart: formatDate(editing?.weekStart ?? null),
      status: editing?.status ?? "ACTIVE",
    });
  }, [editing, form]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <Card className="h-fit">
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          {editing ? "Editar meta" : "Nova meta"}
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Defina objetivos semanais claros.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="title">
            {(field) => (
              <label className="block text-sm text-[rgb(var(--muted))]">
                Meta
                <Input
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Ex: 10 horas de estudo"
                  hasError={field.state.meta.errors.length > 0}
                  className="mt-2"
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="mt-1 text-xs text-[rgb(var(--danger))]">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </label>
            )}
          </form.Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="targetValue">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Meta
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    onBlur={field.handleBlur}
                    className="mt-2"
                  />
                </label>
              )}
            </form.Field>
            <form.Field name="currentValue">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Atual
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    onBlur={field.handleBlur}
                    className="mt-2"
                  />
                </label>
              )}
            </form.Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="unit">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Unidade
                  <Input
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className="mt-2"
                  />
                </label>
              )}
            </form.Field>
            <form.Field name="weekStart">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Semana
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    className="mt-2"
                  />
                </label>
              )}
            </form.Field>
          </div>
          <form.Field name="status">
            {(field) => (
              <label className="block text-sm text-[rgb(var(--muted))]">
                Status
                <Select
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value as GoalFormValues["status"]
                    )
                  }
                  onBlur={field.handleBlur}
                  className="mt-2"
                >
                  {GoalStatusEnum.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </label>
            )}
          </form.Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              {form.state.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          Lista de metas
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Ajuste o progresso conforme evolui.
        </p>
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={goals}
            isLoading={loading}
            error={error}
            emptyTitle="Nenhuma meta cadastrada"
            emptyDescription="Crie uma meta ao lado."
            searchPlaceholder="Buscar metas"
          />
        </div>
      </Card>
    </div>
  );
}
