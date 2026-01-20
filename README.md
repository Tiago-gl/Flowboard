# Dashboard de Produtividade Pessoal (Flowboard)

## 1. Visao geral do aplicativo
Flowboard e um dashboard Notion-lite para tarefas, habitos e metas semanais. O usuario tem uma visao clara do progresso, formularios tipados para criar registros e um layout drag and drop personalizavel com persistencia.

## 2. Stack tecnologica e justificativa
- Vite + React + TypeScript: base rapida, tipagem completa e DX moderna.
- Tailwind CSS: design consistente, responsivo e com tema customizado.
- Lucide React: icones leves e consistentes.
- Zustand: estado global minimo (auth e tema).
- Zod: validacao centralizada e inferencia de tipos.
- TanStack Form: formularios tipados com validacao declarativa.
- TanStack Table: tabelas com ordenacao, filtros e paginacao.
- dnd-kit: drag and drop acessivel para layout.
- Recharts: visualizacoes simples e responsivas.
- Fastify: API rapida e opinativa para CRUD.
- Prisma ORM + SQLite: modelagem tipada e banco leve para ambiente local.

Decisao adicional: Prisma 6.x foi adotado por estabilidade do CLI no ambiente Windows, mantendo compatibilidade com os requisitos do projeto.

## 3. Arquitetura e organizacao de pastas
```
Dashboard/
  client/               # Front-end React
    src/
      components/       # UI e layout
      lib/              # API, schemas e helpers
      pages/            # Telas do app
      store/            # Zustand stores
  server/               # Back-end Fastify
    prisma/             # schema.prisma e migrations
    src/
      lib/              # Prisma client e validacao
      routes/           # Rotas HTTP
      types/            # Tipos do Fastify
```

## 4. Modelagem de dados
### Tabelas
- User
- Task
- Habit
- HabitLog
- Goal
- DashboardLayout

### Colunas (principais)
- User: id, name, email, passwordHash, createdAt, updatedAt
- Task: id, userId, title, description, status, priority, dueDate, completedAt, createdAt, updatedAt
- Habit: id, userId, name, frequency, targetPerWeek, createdAt, updatedAt
- HabitLog: id, habitId, userId, date, count, createdAt
- Goal: id, userId, title, targetValue, currentValue, unit, weekStart, status, createdAt, updatedAt
- DashboardLayout: id, userId, layoutJson, createdAt, updatedAt

### Relacionamentos
- User 1:N Task, Habit, Goal, HabitLog
- Habit 1:N HabitLog
- User 1:1 DashboardLayout

### Regras, enums e indices
- Enums: TaskStatus (TODO, IN_PROGRESS, DONE), TaskPriority (LOW, MEDIUM, HIGH),
  HabitFrequency (DAILY, WEEKLY), GoalStatus (ACTIVE, COMPLETED)
- Uniques: User.email, DashboardLayout.userId, HabitLog(habitId, date)
- Indices: Task(userId, status), Task(userId, dueDate), Habit(userId, frequency), HabitLog(userId, date), Goal(userId, weekStart)

### RLS aplicado
SQLite nao suporta RLS nativo. A politica foi aplicada na camada de API:
- JWT identifica o usuario autenticado.
- Todas as queries filtram por userId.
- Operacoes de update/delete validam ownership antes de executar.

## 5. Mapa de uso do banco
- User -> Auth/Login/Cadastro -> criar conta, autenticar, carregar perfil
- Task -> Tela Tarefas + Dashboard -> listar, criar, editar, concluir, excluir
- Habit -> Tela Habitos + Dashboard -> listar, criar, editar, registrar concluido
- HabitLog -> Dashboard/Analytics -> consolidar habitos por dia
- Goal -> Tela Metas + Dashboard -> listar, criar, editar, atualizar progresso
- DashboardLayout -> Dashboard + Ajustes -> salvar ordem dos cards

## 6. Formularios e validacoes (Zod + TanStack Form)
- Auth: email + password, Register: name + email + password
- Task: titulo, descricao, status, prioridade, dueDate
- Habit: nome, frequencia, targetPerWeek
- Goal: titulo, targetValue, currentValue, unit, weekStart, status
- Validacao centralizada em `client/src/lib/schemas.ts` e espelhada no backend em `server/src/lib/validation.ts`.

## 7. Tabelas e listagens (TanStack Table)
- Todas as listagens (tarefas, habitos, metas) usam TanStack Table.
- Recursos: ordenacao, filtro global, paginacao client-side, estados de vazio/loading/erro.
- Componente reutilizavel: `client/src/components/table/DataTable.tsx`.

## 8. Estado global (Zustand)
- AuthStore: token e dados do usuario com persistencia local.
- ThemeStore: modo light/dark com persistencia.

## 9. Fluxos principais do usuario
- Cadastro/Login -> recebe JWT -> entra no dashboard.
- Criar tarefa/habito/meta -> registro aparece nas tabelas e cards do dashboard.
- Marcar habito concluido -> cria HabitLog e atualiza analiticos.
- Reordenar cards -> layout salvo no backend.
- Alternar tema -> persistencia local imediata.

## 10. Setup local (envs, comandos)
### Requisitos
- Node.js 18+ (testado com Node 24)

### Back-end
```
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Front-end
```
cd client
npm install
npm run dev
```

### Variaveis de ambiente (server/.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me"
CORS_ORIGIN="http://localhost:5173"
PORT="4000"
```

## 11. Checklist de qualidade
- [x] Todas as telas descritas foram implementadas.
- [x] Todas as tabelas definidas foram mapeadas no Prisma.
- [x] Prisma reflete fielmente ao banco.
- [x] Zod usado em todas as validacoes.
- [x] TanStack Form em formularios principais.
- [x] TanStack Table em listagens.
- [x] README completo conforme exigencias.
