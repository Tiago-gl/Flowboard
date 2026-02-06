import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AppLoader from "./components/ui/AppLoader";
import { api } from "./lib/api";
import { demoUser } from "./lib/demo";
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
  const { pathname } = useLocation();
  const isDemo = pathname.startsWith("/demo");

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (isDemo) {
      setStatus("idle");
      return;
    }
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
  }, [token, user, setUser, setStatus, logout, isDemo]);

  if (isDemo) {
    return (
      <AppShell basePath="/demo" isDemo demoUserName={demoUser.name}>
        <Routes>
          <Route path="/demo" element={<DashboardPage />} />
          <Route path="/demo/tarefas" element={<TasksPage />} />
          <Route path="/demo/habitos" element={<HabitsPage />} />
          <Route path="/demo/metas" element={<GoalsPage />} />
          <Route path="/demo/ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/demo" replace />} />
        </Routes>
      </AppShell>
    );
  }

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
