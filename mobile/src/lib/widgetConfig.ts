/**
 * IMPLEMENTAÇÃO DE WIDGETS - GUIA COMPLETO
 * 
 * Este arquivo documenta como implementar widgets verificados para Android e iOS.
 * Os dados são sincronizados via AsyncStorage e podem ser acessados por código nativo.
 */

/**
 * ============ VISÃO GERAL ============
 * 
 * A sincronização de widgets funciona assim:
 * 1. Quando usuário cria/editar/deleta tarefa/meta, os dados são salvos em AsyncStorage
 * 2. Os widgets nativos leem esses dados periodicamente
 * 3. O widget exibe uma prévia das tarefas/metas ativas
 * 4. Ao clicar no widget, abre o app na tela correspondente
 * 
 * Chaves de armazenamento:
 * - "@widgets:tasks" - Array com até 3 tarefas ativas
 * - "@widgets:goals" - Array com até 3 metas ativas
 */

// ============ ANDROID - INSTRUÇÕES DETALHADAS ============

/**
 * 1. CRIAR O LAYOUT DO WIDGET (XML)
 * 
 * Arquivo: android/app/src/main/res/layout/task_widget.xml
 * 
 * ```xml
 * <?xml version="1.0" encoding="utf-8"?>
 * <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
 *     android:layout_width="match_parent"
 *     android:layout_height="match_parent"
 *     android:background="@drawable/widget_background"
 *     android:orientation="vertical"
 *     android:padding="16dp">
 * 
 *     <TextView
 *         android:id="@+id/widget_title"
 *         android:layout_width="wrap_content"
 *         android:layout_height="wrap_content"
 *         android:text="Minhas Tarefas"
 *         android:textSize="18sp"
 *         android:textStyle="bold"
 *         android:textColor="#000000" />
 * 
 *     <ListView
 *         android:id="@+id/widget_tasks_list"
 *         android:layout_width="match_parent"
 *         android:layout_height="match_parent"
 *         android:layout_marginTop="8dp" />
 * 
 * </LinearLayout>
 * ```
 */

/**
 * 2. CRIAR O PROVIDER DO WIDGET (Kotlin)
 * 
 * Arquivo: android/app/src/main/kotlin/com/dashboard/TaskWidgetProvider.kt
 * 
 * ```kotlin
 * package com.dashboard
 * 
 * import android.appwidget.AppWidgetManager
 * import android.appwidget.AppWidgetProvider
 * import android.content.Context
 * import android.widget.RemoteViews
 * import com.facebook.react.bridge.Arguments
 * import android.content.SharedPreferences
 * import org.json.JSONArray
 * 
 * class TaskWidgetProvider : AppWidgetProvider() {
 *     override fun onUpdate(
 *         context: Context,
 *         appWidgetManager: AppWidgetManager,
 *         appWidgetIds: IntArray
 *     ) {
 *         for (appWidgetId in appWidgetIds) {
 *             updateAppWidget(context, appWidgetManager, appWidgetId)
 *         }
 *     }
 * 
 *     private fun updateAppWidget(
 *         context: Context,
 *         appWidgetManager: AppWidgetManager,
 *         appWidgetId: Int
 *     ) {
 *         val tasksJson = getTasksFromStorage(context)
 *         val views = RemoteViews(context.packageName, R.layout.task_widget)
 * 
 *         // Parse JSON e atualizar views
 *         // ...
 * 
 *         appWidgetManager.updateAppWidget(appWidgetId, views)
 *     }
 * 
 *     private fun getTasksFromStorage(context: Context): String {
 *         // Usar Shared Preferences para ler dados sincronizados
 *         val prefs = context.getSharedPreferences("ReactNativeSharedPreferences", Context.MODE_PRIVATE)
 *         return prefs.getString("@widgets:tasks", "[]") ?: "[]"
 *     }
 * }
 * ```
 */

/**
 * 3. ATUALIZAR AndroidManifest.xml
 * 
 * Adicionar dentro de <manifest>:
 * ```xml
 * <uses-permission android:name="android.permission.BIND_APPWIDGET" />
 * <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
 * ```
 * 
 * Adicionar dentro de <application>:
 * ```xml
 * <receiver
 *     android:name=".TaskWidgetProvider"
 *     android:exported="true">
 *     <intent-filter>
 *         <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
 *     </intent-filter>
 *     <meta-data
 *         android:name="android.appwidget.provider"
 *         android:resource="@xml/task_widget_info" />
 * </receiver>
 * ```
 */

// ============ iOS - INSTRUÇÕES DETALHADAS ============

/**
 * 1. CRIAR WIDGET EXTENSION NO XCODE
 * 
 * - Abrir projeto no Xcode
 * - File > New > Target > Widget Extension
 * - Nomear como "DashboardWidget"
 * 
 * 2. CONFIGURAR APP GROUPS
 * 
 * Arquivo: ios/DashboardWidget/DashboardWidget.swift
 * 
 * ```swift
 * import WidgetKit
 * import SwiftUI
 * 
 * struct Provider: TimelineProvider {
 *     func placeholder(in context: Context) -> SimpleEntry {
 *         SimpleEntry(date: Date(), tasks: [], goals: [])
 *     }
 * 
 *     func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
 *         let entry = SimpleEntry(date: Date(), tasks: [], goals: [])
 *         completion(entry)
 *     }
 * 
 *     func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
 *         // Ler dados do App Groups
 *         guard let sharedDefaults = UserDefaults(suiteName: "group.com.dashboard") else {
 *             completion(Timeline(entries: [], policy: .atEnd))
 *             return
 *         }
 *         
 *         let tasksData = sharedDefaults.data(forKey: "@widgets:tasks")
 *         let goalsData = sharedDefaults.data(forKey: "@widgets:goals")
 *         
 *         // Decodificar e criar timeline
 *         let entries = [SimpleEntry(date: Date(), tasks: [], goals: [])]
 *         completion(Timeline(entries: entries, policy: .atEnd))
 *     }
 * }
 * 
 * @main
 * struct DashboardWidget: Widget {
 *     let kind: String = "DashboardWidget"
 * 
 *     var body: some WidgetConfiguration {
 *         StaticConfiguration(
 *             kind: kind,
 *             provider: Provider(),
 *             content: { entry in
 *                 DashboardWidgetEntryView(entry: entry)
 *             }
 *         )
 *         .configurationDisplayName("Dashboard Widgets")
 *         .description("Veja suas tarefas e metas em andamento")
 *     }
 * }
 * ```
 * 
 * 3. ATUALIZAR app.json para App Groups
 * 
 * ```json
 * {
 *   "plugins": [
 *     [
 *       "expo-build-properties",
 *       {
 *         "ios": {
 *           "useFrameworks": "static",
 *           "deploymentTarget": "15.0"
 *         }
 *       }
 *     ]
 *   ]
 * }
 * ```
 */

// ============ ESTRUTURA DE DADOS ============

export interface WidgetTask {
  id: string;
  title: string;
  status: "A_FAZER" | "EM_ANDAMENTO" | "FEITO";
  priority: "ALTA" | "MEDIA" | "BAIXA";
  dueDate?: string;
}

export interface WidgetGoal {
  id: string;
  title: string;
  status: "ATIVA" | "PAUSADA" | "CONCLUIDA";
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
}

export interface WidgetData {
  tasks: WidgetTask[];
  goals: WidgetGoal[];
  lastUpdated: string;
}

// ============ CHAVES DE ARMAZENAMENTO ============

export const WIDGET_KEYS = {
  TASKS: "@widgets:tasks",
  GOALS: "@widgets:goals",
  APP_GROUP: "group.com.dashboard",
} as const;

// ============ PRÓXIMAS ETAPAS ============

/**
 * Para implementação completa:
 * 
 * 1. ✅ Backend: Sincronizar dados via AsyncStorage
 * 2. ✅ Frontend: Criar componentes de prévia do widget
 * 3. ⏳ Android: Implementar AppWidgetProvider nativo
 * 4. ⏳ iOS: Implementar WidgetKit extension nativa
 * 5. ⏳ Deep Linking: Abrir app na tela certa ao clicar widget
 * 6. ⏳ Notificações: Atualizar widget ao receber notificação
 * 7. ⏳ Multi-tamanho: Suportar widgets pequeno, médio e grande
 * 
 * Recursos úteis:
 * - Android: https://developer.android.com/develop/ui/views/appwidgets/overview
 * - iOS: https://developer.apple.com/documentation/widgetkit
 * - Expo: https://docs.expo.dev/build/setup/
 */

