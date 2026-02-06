import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: React.ReactNode;
  basePath?: string;
  isDemo?: boolean;
  demoUserName?: string;
};

export default function AppShell({
  children,
  basePath = "",
  isDemo = false,
  demoUserName,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex max-w-7xl">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          basePath={basePath}
          isDemo={isDemo}
        />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {isDemo ? (
            <div className="mb-4 rounded-2xl border border-[rgba(var(--accent),0.3)] bg-[rgba(var(--accent),0.08)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent))]">
              Demo somente leitura. As alteracoes nao serao salvas.
            </div>
          ) : null}
          <Topbar
            onOpenSidebar={() => setSidebarOpen(true)}
            isDemo={isDemo}
            demoUserName={demoUserName}
          />
          <main className="mt-6 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
