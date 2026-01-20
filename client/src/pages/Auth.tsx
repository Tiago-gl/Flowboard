import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodFormValidator } from "../lib/form";
import { Lock, Mail, User } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api, ApiError } from "../lib/api";
import {
  AuthSchema,
  RegisterSchema,
  type AuthValues,
  type RegisterValues,
} from "../lib/schemas";
import { useAuthStore } from "../store/authStore";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const loginForm = useForm({
    defaultValues: { email: "", password: "" },
    validatorAdapter: zodFormValidator<AuthValues>(),
    validators: {
      onSubmit: AuthSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const response = await api.login(value);
        login(response.token, response.user);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Nao foi possivel autenticar.");
        }
      }
    },
  });

  const registerForm = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validatorAdapter: zodFormValidator<RegisterValues>(),
    validators: {
      onSubmit: RegisterSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const response = await api.register(value);
        login(response.token, response.user);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Nao foi possivel autenticar.");
        }
      }
    },
  });

  return (
    <div className="min-h-screen bg-app px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent))]">
              Flowboard
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[rgb(var(--text))]">
              Organize tarefas, habitos e metas em um unico painel.
            </h1>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">
              Visual simples, drag and drop e insights semanais para manter o foco
              sem perder o ritmo.
            </p>
          </div>
          <div className="mt-8 space-y-3 text-xs text-[rgb(var(--muted))]">
            <p>- Layout personalizavel</p>
            <p>- Modo escuro persistente</p>
            <p>- Analises semanais instantaneas</p>
          </div>
        </Card>
        <Card elevated className="self-start">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h2>
            <p className="text-sm text-[rgb(var(--muted))]">
              {mode === "login"
                ? "Acesse seu dashboard com seu e-mail."
                : "Configure seu perfil em segundos."}
            </p>
          </div>
          {error ? (
            <div className="mb-4 rounded-2xl border border-[rgba(var(--danger),0.4)] bg-[rgba(var(--danger),0.08)] px-4 py-3 text-xs text-[rgb(var(--danger))]">
              {error}
            </div>
          ) : null}
          {mode === "login" ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void loginForm.handleSubmit();
              }}
            >
              <loginForm.Field name="email">
                {(field) => (
                  <label className="block text-sm text-[rgb(var(--muted))]">
                    E-mail
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.8)] px-3 py-2">
                      <Mail size={16} className="text-[rgb(var(--muted))]" />
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="voce@exemplo.com"
                        hasError={field.state.meta.errors.length > 0}
                        className="border-none px-0 py-0 shadow-none focus:ring-0"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 ? (
                      <p className="mt-1 text-xs text-[rgb(var(--danger))]">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </label>
                )}
              </loginForm.Field>
              <loginForm.Field name="password">
                {(field) => (
                  <label className="block text-sm text-[rgb(var(--muted))]">
                    Senha
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.8)] px-3 py-2">
                      <Lock size={16} className="text-[rgb(var(--muted))]" />
                      <Input
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="********"
                        hasError={field.state.meta.errors.length > 0}
                        className="border-none px-0 py-0 shadow-none focus:ring-0"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 ? (
                      <p className="mt-1 text-xs text-[rgb(var(--danger))]">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </label>
                )}
              </loginForm.Field>
              <Button type="submit" className="w-full">
                {loginForm.state.isSubmitting ? "Enviando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void registerForm.handleSubmit();
              }}
            >
              <registerForm.Field name="name">
                {(field) => (
                  <label className="block text-sm text-[rgb(var(--muted))]">
                    Nome
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.8)] px-3 py-2">
                      <User size={16} className="text-[rgb(var(--muted))]" />
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Seu nome"
                        hasError={field.state.meta.errors.length > 0}
                        className="border-none px-0 py-0 shadow-none focus:ring-0"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 ? (
                      <p className="mt-1 text-xs text-[rgb(var(--danger))]">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </label>
                )}
              </registerForm.Field>
              <registerForm.Field name="email">
                {(field) => (
                  <label className="block text-sm text-[rgb(var(--muted))]">
                    E-mail
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.8)] px-3 py-2">
                      <Mail size={16} className="text-[rgb(var(--muted))]" />
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="voce@exemplo.com"
                        hasError={field.state.meta.errors.length > 0}
                        className="border-none px-0 py-0 shadow-none focus:ring-0"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 ? (
                      <p className="mt-1 text-xs text-[rgb(var(--danger))]">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </label>
                )}
              </registerForm.Field>
              <registerForm.Field name="password">
                {(field) => (
                  <label className="block text-sm text-[rgb(var(--muted))]">
                    Senha
                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.8)] px-3 py-2">
                      <Lock size={16} className="text-[rgb(var(--muted))]" />
                      <Input
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="********"
                        hasError={field.state.meta.errors.length > 0}
                        className="border-none px-0 py-0 shadow-none focus:ring-0"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 ? (
                      <p className="mt-1 text-xs text-[rgb(var(--danger))]">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </label>
                )}
              </registerForm.Field>
              <Button type="submit" className="w-full">
                {registerForm.state.isSubmitting ? "Enviando..." : "Criar conta"}
              </Button>
            </form>
          )}
          <div className="mt-6 text-xs text-[rgb(var(--muted))]">
            {mode === "login" ? "Ainda nao possui conta?" : "Ja possui conta?"}{" "}
            <button
              type="button"
              className="font-semibold text-[rgb(var(--accent))]"
              onClick={() =>
                setMode((current) => (current === "login" ? "register" : "login"))
              }
            >
              {mode === "login" ? "Criar agora" : "Entrar"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
