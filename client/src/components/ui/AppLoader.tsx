import Card from "./Card";

type AppLoaderProps = {
  label?: string;
};

export default function AppLoader({ label = "Carregando..." }: AppLoaderProps) {
  return (
    <div className="min-h-screen bg-app px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
        <Card className="w-full text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[rgba(var(--accent),0.3)] border-t-[rgb(var(--accent))]" />
          <p className="text-sm text-[rgb(var(--muted))]">{label}</p>
        </Card>
      </div>
    </div>
  );
}
