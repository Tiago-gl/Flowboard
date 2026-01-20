import { Menu, Moon, Sun, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import Button from "../ui/Button";

type TopbarProps = {
  onOpenSidebar: () => void;
};

export default function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const { mode, toggle } = useThemeStore();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="rounded-2xl border border-[rgba(var(--border),0.7)] sm:hidden"
          onClick={onOpenSidebar}
        >
          <Menu size={18} />
        </Button>
        <div>
          <p className="text-sm text-[rgb(var(--muted))]">Bem-vindo,</p>
          <p className="text-lg font-semibold text-[rgb(var(--text))]">
            {user?.name ?? "Produtivo"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={toggle} className="rounded-2xl">
          {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-sm font-medium">
            {mode === "light" ? "Dark" : "Light"}
          </span>
        </Button>
        <Button variant="ghost" onClick={logout} className="rounded-2xl">
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair</span>
        </Button>
      </div>
    </header>
  );
}
