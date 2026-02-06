import { useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodFormValidator } from "../lib/form";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import DataTable from "../components/table/DataTable";
import { api, ApiError } from "../lib/api";
import { demoHabits, useDemoMode } from "../lib/demo";
import { HabitFormSchema, HabitFrequencyEnum } from "../lib/schemas";
import type { Habit, HabitFormValues } from "../lib/schemas";

export default function HabitsPage() {
  const isDemo = useDemoMode();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Habit | null>(null);

  const loadHabits = async () => {
    setLoading(true);
    setError(null);
    if (isDemo) {
      setHabits(demoHabits);
      setLoading(false);
      return;
    }
    try {
      const response = await api.getHabits({ pageSize: 100 });
      setHabits(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHabits();
  }, [isDemo]);

  const handleSubmit = async (values: HabitFormValues) => {
    if (isDemo) return;
    const payload = {
      ...values,
      targetPerWeek: values.targetPerWeek ? Number(values.targetPerWeek) : null,
    };
    if (editing) {
      await api.updateHabit(editing.id, payload);
    } else {
      await api.createHabit(payload);
    }
    setEditing(null);
    await loadHabits();
  };

  const columns = useMemo<ColumnDef<Habit>[]>(() => {
    const base: ColumnDef<Habit>[] = [
      {
        accessorKey: "name",
        header: "Habito",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">
              {row.original.name}
            </p>
            <p className="text-xs text-[rgb(var(--muted))]">
              {row.original.frequency}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "targetPerWeek",
        header: "Meta",
        cell: ({ row }) => (
          <Badge tone="accent">
            {row.original.targetPerWeek
              ? `${row.original.targetPerWeek}x/semana`
              : "Flexivel"}
          </Badge>
        ),
      },
    ];
    if (!isDemo) {
      base.push({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                api
                  .logHabit(row.original.id, {
                    date: new Date().toISOString(),
                  })
                  .then(loadHabits)
              }
            >
              <CheckCircle2 size={16} />
            </Button>
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
                await api.deleteHabit(row.original.id);
                await loadHabits();
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
      name: editing?.name ?? "",
      frequency: editing?.frequency ?? "DAILY",
      targetPerWeek: editing?.targetPerWeek ?? 3,
    },
    validatorAdapter: zodFormValidator<HabitFormValues>(),
    validators: {
      onSubmit: HabitFormSchema,
    },
    onSubmit: async ({ value }) => {
      await handleSubmit(value);
    },
  });

  useEffect(() => {
    form.reset({
      name: editing?.name ?? "",
      frequency: editing?.frequency ?? "DAILY",
      targetPerWeek: editing?.targetPerWeek ?? 3,
    });
  }, [editing, form]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <Card className="h-fit">
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          {editing ? "Editar habito" : "Novo habito"}
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Habitue-se a novas rotinas.
        </p>
        {isDemo ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent))]">
            Demo somente leitura
          </p>
        ) : null}
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <label className="block text-sm text-[rgb(var(--muted))]">
                Nome
                <Input
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Ex: Caminhar 30 min"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="frequency">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Frequencia
                  <Select
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as HabitFormValues["frequency"]
                      )
                    }
                    onBlur={field.handleBlur}
                    className="mt-2"
                    disabled={isDemo}
                  >
                    {HabitFrequencyEnum.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
              )}
            </form.Field>
            <form.Field name="targetPerWeek">
              {(field) => (
                <label className="block text-sm text-[rgb(var(--muted))]">
                  Meta semanal
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    onBlur={field.handleBlur}
                    className="mt-2"
                    disabled={isDemo}
                  />
                </label>
              )}
            </form.Field>
          </div>
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
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          Lista de habitos
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Marque concluido e mantenha consistencia.
        </p>
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={habits}
            isLoading={loading}
            error={error}
            emptyTitle="Nenhum habito cadastrado"
            emptyDescription="Crie um habito ao lado."
            searchPlaceholder="Buscar habitos"
          />
        </div>
      </Card>
    </div>
  );
}
