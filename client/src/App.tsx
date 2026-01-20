import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AppLoader from "./components/ui/AppLoader";
import { api } from "./lib/api";
import { applyTheme, useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import GoalsPage from "./pages/Goals";
import HabitsPage from "./pages/Habits";
import SettingsPage from "./pages/Settings";
import TasksPage from "./pages/Tasks";

const publicRoutes = (
  <Routes>
    <Route path="*" element={<AuthPage />} />
  </Routes>
);

export default function App() {
  const { token, user, status, setUser, setStatus, logout } = useAuthStore();
  const { mode } = useThemeStore();

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      if (!token) {
        setStatus("idle");
        return;
      }
      if (user) {
        setStatus("ready");
        return;
      }
      setStatus("loading");
      try {
        const me = await api.getMe();
        if (active) {
          setUser(me);
          setStatus("ready");
        }
      } catch (error) {
        if (active) {
          logout();
          setStatus("idle");
        }
      }
    };
    void loadUser();
    return () => {
      active = false;
    };
  }, [token, user, setUser, setStatus, logout]);

  if (!token) {
    return publicRoutes;
  }

  if (status === "loading") {
    return <AppLoader label="Carregando seu painel..." />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tarefas" element={<TasksPage />} />
        <Route path="/habitos" element={<HabitsPage />} />
        <Route path="/metas" element={<GoalsPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
