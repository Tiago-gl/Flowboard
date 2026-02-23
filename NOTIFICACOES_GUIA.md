# 📱 Guia Completo: Sistema de Notificações no Mobile

## 📍 O que foi implementado

Um sistema de notificações que **alerta o usuário 1 hora antes** da data limite de uma **tarefa ou meta**, com sons, badges e alertas visuais.

---

## 🔧 Instalação (Passo Inicial Importante!)

Você precisa instalar a biblioteca `expo-notifications`. Execute este comando na pasta `mobile`:

```bash
npm install expo-notifications@~0.27.0
```

Ou se preferir usar yarn:
```bash
yarn add expo-notifications@~0.27.0
```

Depois execute:
```bash
npm install
# ou
yarn
```

---

## 📚 Como Tudo Funciona (Passo a Passo)

### 1️⃣ **Arquivo: `mobile/src/lib/notifications.ts`**

Este é o **módulo central** de notificações com 6 funções principais:

#### **Função 1: `setNotificationHandler()`**
```typescript
Notifications.setNotificationHandler({
  shouldShowAlert: true,    // Mostrar banner no topo da tela
  shouldPlaySound: true,    // Tocar som (padrão do sistema)
  shouldSetBadge: true,     // Mostrar número de notificações no ícone
});
```
**O que faz:** Configura como a notificação se comporta quando chega.

---

#### **Função 2: `requestNotificationPermissions()`**
```typescript
export const requestNotificationPermissions = async () => {
  // Verificar se já tem permissão
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  // Se não tem, solicita permissão do usuário
  const { status } = await Notifications.requestPermissionsAsync();
  
  return status === "granted"; // Retorna true se conseguiu permissão
}
```
**O que faz:** Pede ao usuário permissão para enviar notificações. No iOS é obrigatório, no Android é recomendado.

**Quando usar:** Chama uma vez quando a tela carrega (no `useEffect`).

---

#### **Função 3: `scheduleNotification()`** (Função Auxiliar)
```typescript
export const scheduleNotification = async (
  title: string,           // Ex: "Meta: Estudar React"
  body: string,            // Ex: "Você tem até hoje"
  trigger: NotificationTriggerInput  // Quando mostrar
)
```
**O que faz:** Agenda uma notificação genérica que será mostrada em um tempo específico.

**Trigger examples:**
```typescript
{ seconds: 3600 }  // Em 1 hora
{ seconds: 60 }    // Em 1 minuto
```

---

#### **Função 4: `scheduleNotificationForDate()`** (A Mais Importante!)
```typescript
export const scheduleNotificationForDate = async (
  title: string,      // Título da notificação
  body: string,       // Descrição
  dueDate: string     // Data ISO (ex: "2026-02-22T10:00:00.000Z")
)
```

**O que faz:** 
- ✅ Recebe uma data de vencimento
- ✅ Calcula automaticamente: **1 hora antes**
- ✅ Agenda a notificação para esse tempo
- ✅ Se já passou, não agenda

**Exemplo na prática:**
```
Tarefa vence em: 22/02/2026 às 10:00
Notificação dispara em: 22/02/2026 às 09:00
```

---

#### **Função 5: `cancelNotification()`**
```typescript
export const cancelNotification = async (notificationId: string)
```
**O que faz:** Cancela uma notificação agendada. Usamos quando a tarefa é deletada.

---

#### **Função 6: `getAllScheduledNotifications()`** (DEBUG)
```typescript
export const getAllScheduledNotifications = async ()
```
**O que faz:** Lista TODAS as notificações agendadas. Útil para debug.

---

### 2️⃣ **Integração no GoalsScreen**

#### **a) Import**
```typescript
import {
  requestNotificationPermissions,
  scheduleNotificationForDate,
  cancelNotification,
} from "../lib/notifications";
```

#### **b) Novo Estado**
```typescript
// Armazenar IDs de notificações para poder cancelá-las depois
const [notificationIds, setNotificationIds] = useState<Record<string, string>>({});
```
**Por que?** Para rastrear qual notificação corresponde a qual meta, permitindo cancelar se deletar.

#### **c) Solicitar Permissões ao Carregar**
```typescript
useEffect(() => {
  void load();
  // Solicitar permissões de notificação quando a tela carregar
  void requestNotificationPermissions();
}, []);
```
**Quando?** Na primeira vez que o usuário abre a tela.

#### **d) Agendar Notificação ao Criar/Editar Meta**
```typescript
if (editing) {
  const updated = await api.updateGoal(editing.id, payload);
  
  // Agendar notificação para 1 hora antes da data
  const notifId = await scheduleNotificationForDate(
    `Meta: ${updated.title}`,
    `Você tem até ${formatDateToBR(updated.weekStart.slice(0, 10))} para atingir ${updated.targetValue} ${updated.unit}`,
    updated.weekStart
  );
  
  // Armazenar ID para poder cancelar depois
  if (notifId) {
    setNotificationIds((prev) => ({ ...prev, [updated.id]: notifId }));
  }
}
```

#### **e) Cancelar Notificação ao Deletar Meta**
```typescript
const handleDelete = async (id: string) => {
  // Recuperar ID da notificação
  const notifId = notificationIds[id];
  
  // Cancelar se existir
  if (notifId) {
    await cancelNotification(notifId);
  }
  
  // Deletar meta
  await api.deleteGoal(id);
  
  // Remover ID do estado
  setNotificationIds((prev) => {
    const newIds = { ...prev };
    delete newIds[id];
    return newIds;
  });
};
```

---

### 3️⃣ **Integração no TasksScreen**

**Exatamente igual ao GoalsScreen!** Com a diferença que:

```typescript
// Em vez de weekStart, usamos dueDate para tarefas
if (created.dueDate) {
  const notifId = await scheduleNotificationForDate(
    `Tarefa: ${created.title}`,
    `Data limite: ${formatDateToBR(created.dueDate.slice(0, 10))} - Prioridade: ${created.priority}`,
    created.dueDate  // ← Data de vencimento da tarefa
  );
}
```

---

## 🎯 Fluxo Completo (Visualização)

```
Usuário cria tarefa com data: 22/02/2026 às 15:00
                    ↓
    scheduleNotificationForDate() é chamada
                    ↓
    Calcula 1 hora antes = 22/02/2026 às 14:00
                    ↓
    Retorna notificationId (ex: "abc123")
                    ↓
    ID é armazenado em notificationIds[taskId] = "abc123"
                    ↓
    Quando chega 14:00, notificação é disparada ✨
                    ↓
Usuário clica no banner da notificação e vê a tarefa
```

---

## 💡 Conceitos Importantes

### **AsyncStorage vs Notificações Agendadas**
- **AsyncStorage:** Salva dados que persistem (preferências, dados locais)
- **Notificações:** São agendadas no **sistema operacional iOS/Android**, não na app
- **Benefício:** Notificações funcionam mesmo se a app for fechada!

### **Por que 1 hora antes?**
- Tempo suficiente para o usuário se preparar
- Não é tão cedo que possa esquecer
- Customizável: pode mudar em `notifications.ts`

### **IDs de Notificações**
- Cada notificação agendada recebe um ID único
- Precisamos armazenar para poder cancelar depois
- Se não cancelar, fica agendada para sempre (até o SO limpar)

---

## 🚀 Próximos Passos (Opcional)

### **1. Customizar Tempo Antes**
Em `mobile/src/lib/notifications.ts`, mude essa linha:
```typescript
// De:
const oneHourBefore = new Date(dueDateObj.getTime() - 60 * 60 * 1000);

// Para (30 minutos):
const oneHourBefore = new Date(dueDateObj.getTime() - 30 * 60 * 1000);

// Para (2 horas):
const oneHourBefore = new Date(dueDateObj.getTime() - 2 * 60 * 60 * 1000);
```

### **2. Adicionar Ícone Customizado**
```typescript
content: {
  title,
  body,
  sound: 'default',
  color: '#007AFF',  // Cor azul em notificação Android
}
```

### **3. Abrir Screen ao Clicar**
```typescript
// Adicione isso em App.tsx com react-navigation
Notifications.addNotificationResponseReceivedListener(response => {
  // Navegar para tela de tarefas/metas
  navigation.navigate('Tasks');
});
```

---

## ✅ Checklist: Tudo Pronto?

- [ ] Instalou `expo-notifications`? (`npm install expo-notifications@~0.27.0`)
- [ ] Arquivo `notifications.ts` criado?
- [ ] `GoalsScreen.tsx` atualizado com imports?
- [ ] `TasksScreen.tsx` atualizado com imports?
- [ ] Permissões sendo solicitadas ao carregar?
- [ ] IDs de notificações sendo armazenados?
- [ ] Notificações sendo canceladas ao deletar?

---

## 🐛 Debug: Como Testar

### **Ver todas as notificações agendadas**
No início de `GoalsScreen` ou `TasksScreen`, adicione:
```typescript
import { getAllScheduledNotifications } from "../lib/notifications";

// Dentro do component:
const testNotifications = async () => {
  const scheduled = await getAllScheduledNotifications();
  console.log("Notificações agendadas:", scheduled);
};
```

### **Agendar notificação de teste (30 segundos)**
```typescript
import { scheduleNotification } from "../lib/notifications";

const testNotif = async () => {
  await scheduleNotification(
    "🧪 Teste!",
    "Esta notificação vai chegar em 30 segundos",
    { seconds: 30 }
  );
};
```

---

## 📖 Resumo Visual

```
┌─────────────────────────────────────────┐
│     Usuário Cria Tarefa/Meta            │
│           (com data)                    │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  scheduleNotificationForDate()           │
│  - Recebe data: 22/02 15:00             │
│  - Calcula: 22/02 14:00 (1h antes)      │
│  - Retorna: notificationId              │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Armazenar ID em notificationIds[]       │
│  notificationIds[taskId] = "abc123"     │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Espera até 14:00...                    │
│  (iOS/Android cuida disso)              │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  ✨ NOTIFICAÇÃO DISPARADA! ✨            │
│  "Tarefa: Estudar React"                │
│  "Data limite: 22/02/2026"              │
└─────────────────────────────────────────┘
```

---

## 🎓 Aprendizados Principais

1. **Expo oferece APIs nativas simplificadas** para notificações
2. **Notificações persistem no SO**, não dependem da app estar aberta
3. **IDs são essenciais** para gerenciar (cancelar) notificações depois
4. **Timestamps ISO** são o padrão: `"2026-02-22T15:00:00.000Z"`
5. **Async/await** é perfeito para operações de notificação

---

## 📝 Próxima Implementação

Depois de testar as notificações, você pode:
- [ ] Adicionar opções de som customizado
- [ ] Permitir usuário escolher tempo antes (15min, 30min, 1h, etc)
- [ ] Armazenar preferências em AsyncStorage
- [ ] Implementar deep linking (abrir diretamente a tarefa ao clicar)
