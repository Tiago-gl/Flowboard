# Guia de Widgets - Dashboard Mobile

## 📱 Visão Geral

Os widgets permitem que os usuários visualizem suas tarefas e metas **em andamento diretamente nas notificações persistentes**, sem precisar abrir o aplicativo.

## 🚀 Como Funciona

### Solução Implementada: Notificações Persistentes

A solução usa **notificações persistentes (não-dismissíveis)** que aparecem:
- ✅ Na tela de notificações (pull-down do status bar)
- ✅ Na tela inicial do dispositivo
- ✅ Sincronizadas automaticamente
- ✅ Sem dependências externas além do Expo

### Fluxo:

```
Usuario cria/edita tarefa
    ↓
syncTasksToWidget() é chamado
    ↓
Top 5 tarefas ativas são salvas em AsyncStorage
    ↓
Notificação persistente é criada/atualizada
    ↓
Notificação aparece no painel de notificações e tela inicial
    ↓
Usuario pode clicar para abrir o app
```

## 📊 Dados Sincronizados

### Notificação de Tarefas
- **ID**: `widget_tasks_summary`
- **Titulo**: 📋 X Tarefa(s)
- **Conteúdo**: Lista das tarefas ativas
- **Tipo**: Não-dismissível (persistente)

### Notificação de Metas
- **ID**: `widget_goals_summary`
- **Titulo**: 🎯 X Meta(s)
- **Conteúdo**: Lista das metas ativas
- **Tipo**: Não-dismissível (persistente)

## 🔄 Sincronização Automática

A sincronização ocorre automaticamente em:

✅ **TasksScreen.tsx**
```typescript
load() → await syncTasksToWidget(data.items)
handleCreate() → await syncTasksToWidget(updated)
handleDelete() → await syncTasksToWidget(filtered)
```

✅ **GoalsScreen.tsx**
```typescript
load() → await syncGoalsToWidget(data.items)
handleCreate() → await syncGoalsToWidget(updated)
handleDelete() → await syncGoalsToWidget(filtered)
```

## 👁️ Prévia de Dados

Na tela **Settings**, toque em "Ver Prévia do Widget" para:
- Ver quantas tarefas e metas estão sincronizadas
- Testar os dados sem publicar

## 💡 Como Usar

### 1. **Criar/Editar Tarefas**
   - Abra a tela de Tarefas
   - Crie uma nova tarefa
   - A notificação será atualizada automaticamente
   - Deslize a barra de notificações para ver

### 2. ***Visualizar Widget**
   - Deslize para baixo a partir do topo (status bar)
   - Veja as notificações persistentes com tarefas e metas
   - Clique para abrir o app na tela relevante

### 3. **Desativar/Ativar**
   - Embora persistentes, as notificações podem ser deslizadas
   - Ao recarregar os dados, serão recriadas
   - Faça logout para limpar as notificações

## 🔧 Funções Disponíveis

```typescript
// Sincronizar tarefas
await syncTasksToWidget(tasks: Task[])

// Sincronizar metas
await syncGoalsToWidget(goals: Goal[])

// Obter prévia das tarefas
const preview = await getWidgetTasksPreview()

// Obter prévia das metas
const preview = await getWidgetGoalsPreview()

// Limpar todos os widgets
await clearAllWidgets()

// Inicializar (chamado no app startup)
await initializeWidgets()
```

## 📍 Localização dos Arquivos

- **Módulo de Widgets**: `mobile/src/lib/widgets.ts`
- **Componentes de Prévia**: `mobile/src/components/WidgetPreview.tsx`
- **Integração em Tarefas**: `mobile/src/screens/TasksScreen.tsx`
- **Integração em Metas**: `mobile/src/screens/GoalsScreen.tsx`
- **Settings**: `mobile/src/screens/SettingsScreen.tsx`

## 🎯 Vantagens desta Solução

✅ **Sem dependências externas** - Usa apenas Expo Notifications\
✅ **Funciona em Android e iOS** - Mesmo código para ambos\
✅ **Sincronização em tempo real** - Atualiza imediatamente\
✅ **Persisten** - Não desaparece ao fechar o app\
✅ **Acessível** - Aparece no painel de notificações\
✅ **Simples** - Apenas 1 arquivo de implementação\

## 🔮 Futuras Melhorias

| Feature | Complexidade | Descrição |
|---------|--------------|-----------|
| Deep Linking | ⭐⭐ | Clicar na notificação abre a tela certa |
| Som Customizado | ⭐ | Som específico para notificações do widget |
| Ícones | ⭐⭐ | Mostrar imagens nas notificações |
| Atualização em Background | ⭐⭐⭐ | Sincronizar sem abrir o app |
| Widget Tradicional (iOS) | ⭐⭐⭐⭐ | Implementar WidgetKit nativa |
| Widget Tradicional (Android) | ⭐⭐⭐⭐ | Implementar AppWidgetProvider nativa |

## ❓ Perguntas Frequentes

**P: A notificação desaparece automaticamente?**
R: Não, é persistente. O usuário pode deslizar para remover, mas será recriada ao sincronizar dados.

**P: Funciona em segundo plano?**
R: As notificações que já existem sim. A sincronização é feita quando o app está aberto.

**P: Posso customizar o texto?**
R: Sim, edite `syncTasksToWidget()` e `syncGoalsToWidget()` em `widgets.ts`.

**P: E se mudar de dispositivo?**
R: As notificações são criadas localmente, portanto não sincronizam entre dispositivos.

**P: Quanto espaço usa?**
R: Muito pouco. As notificações são apenas references aos dados armazenados localmente.

## 🚀 Para Começar

1. ✅ Componentes prontos
2. ✅ Sincronização automática
3. ✅ Funções testadas
4. ✅ Settings configurado

**Basta usar!** As notificações aparecerão automaticamente quando tarefas/metas estiverem em andamento.

## 📞 Suporte

Para questões técnicas, verifique:
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- Arquivo `widgets.ts` para ver a implementação
