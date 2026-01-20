import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ListChecks,
  Repeat,
  Target,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/cn";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutGrid },
  { label: "Tarefas", to: "/tarefas", icon: ListChecks },
  { label: "Habitos", to: "/habitos", icon: Repeat },
  { label: "Metas", to: "/metas", icon: Target },
  { label: "Ajustes", to: "/ajustes", icon: Settings },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/30 transition sm:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[rgba(var(--border),0.8)] bg-[rgb(var(--surface))] px-4 py-6 transition sm:static sm:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 rounded-3xl bg-[rgba(var(--accent),0.12)] px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent))]">
            Flowboard
          </p>
          <p className="text-lg font-semibold text-[rgb(var(--text))]">
            Produtividade pessoal
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[rgb(var(--accent))] text-white shadow"
                      : "text-[rgb(var(--muted))] hover:bg-[rgba(var(--accent),0.12)] hover:text-[rgb(var(--text))]"
                  )
                }
                onClick={onClose}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="rounded-2xl bg-[rgb(var(--bg-alt))] px-3 py-4 text-xs text-[rgb(var(--muted))]">
          <p className="font-semibold text-[rgb(var(--text))]">
            Dica do dia
          </p>
          <p className="mt-1">
            Escolha 3 prioridades e finalize uma antes do meio-dia.
          </p>
        </div>
      </aside>
    </>
  );
}
