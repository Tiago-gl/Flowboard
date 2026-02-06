import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { api } from "../lib/api";
import { demoUser, useDemoMode } from "../lib/demo";

const defaultCards = ["summary", "tasks", "habits", "goals", "analytics"];

export default function SettingsPage() {
  const isDemo = useDemoMode();
  const authUser = useAuthStore((state) => state.user);
  const user = isDemo ? demoUser : authUser;
  const { mode, toggle } = useThemeStore();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          Preferencias
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Ajuste tema e layout do dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={toggle}>
            Alternar para {mode === "light" ? "modo escuro" : "modo claro"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!isDemo) {
                void api.updateLayout({ cards: defaultCards });
              }
            }}
            disabled={isDemo}
          >
            Resetar layout
          </Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          Seu perfil
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Informacoes basicas da conta.
        </p>
        <div className="mt-6 space-y-3 text-sm text-[rgb(var(--muted))]">
          <p>
            <span className="font-semibold text-[rgb(var(--text))]">Nome:</span>{" "}
            {user?.name ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-[rgb(var(--text))]">Email:</span>{" "}
            {user?.email ?? "-"}
          </p>
        </div>
      </Card>
    </div>
  );
}
