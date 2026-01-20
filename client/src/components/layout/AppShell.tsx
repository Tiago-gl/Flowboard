import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex max-w-7xl">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="mt-6 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
