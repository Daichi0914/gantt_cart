// インフラストラクチャ層: API クライアント

import type { Task, TasksApiResponse, TaskApiResponse } from "@/lib/types"

// API エンドポイントの基本URL (将来的に環境変数から取得)
const API_BASE_URL = "/api"

// APIリクエストのタイムアウト時間 (ミリ秒)
const API_TIMEOUT = 2000

// APIリクエストのシミュレーション用の遅延時間 (ミリ秒)
const SIMULATED_DELAY = 300

// シリアライズされたタスクの型定義
interface SerializedTask {
  id: string
  title: string
  startDate: string // ISO文字列形式
  endDate: string // ISO文字列形式
  color: string
}

/**
 * タスクAPI クライアント
 * 将来的に実際のバックエンドAPIと連携する際に使用するクラス
 */
export class TaskApiClient {
  /**
   * すべてのタスクを取得
   */
  static async getTasks(): Promise<TasksApiResponse> {
    try {
      // シミュレートされた遅延
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY))

      // ローカルストレージからタスクを取得
      const tasksJson = localStorage.getItem("gantt_tasks")
      const serializedTasks: SerializedTask[] = tasksJson ? JSON.parse(tasksJson) : []
      const tasks = serializedTasks.map(this.deserializeTask)

      return {
        success: true,
        data: tasks,
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      return {
        success: false,
        data: [],
        error: "タスクの取得に失敗しました",
      }
    }
  }

  /**
   * 新しいタスクを作成
   */
  static async createTask(task: Omit<Task, "id">): Promise<TaskApiResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY))

      // 既存のタスクを取得
      const tasksJson = localStorage.getItem("gantt_tasks")
      const serializedTasks: SerializedTask[] = tasksJson ? JSON.parse(tasksJson) : []
      const tasks = serializedTasks.map(this.deserializeTask)

      // 新しいタスクを作成
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
      }

      // タスクを保存
      const updatedSerializedTasks = [...serializedTasks, this.serializeTask(newTask)]
      localStorage.setItem("gantt_tasks", JSON.stringify(updatedSerializedTasks))

      return {
        success: true,
        data: newTask,
      }
    } catch (error) {
      console.error("Failed to create task:", error)
      return {
        success: false,
        data: {} as Task,
        error: "タスクの作成に失敗しました",
      }
    }
  }

  /**
   * タスクを更新
   */
  static async updateTask(task: Task): Promise<TaskApiResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY))

      // 既存のタスクを取得
      const tasksJson = localStorage.getItem("gantt_tasks")
      const serializedTasks: SerializedTask[] = tasksJson ? JSON.parse(tasksJson) : []

      // タスクを更新
      const updatedSerializedTasks = serializedTasks.map((t) => (t.id === task.id ? this.serializeTask(task) : t))

      // 更新したタスクを保存
      localStorage.setItem("gantt_tasks", JSON.stringify(updatedSerializedTasks))

      return {
        success: true,
        data: task,
      }
    } catch (error) {
      console.error("Failed to update task:", error)
      return {
        success: false,
        data: {} as Task,
        error: "タスクの更新に失敗しました",
      }
    }
  }

  /**
   * タスクを削除
   */
  static async deleteTask(taskId: string): Promise<{
    success: boolean
    data: boolean
    error?: string
  }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY))

      // 既存のタスクを取得
      const tasksJson = localStorage.getItem("gantt_tasks")
      const serializedTasks: SerializedTask[] = tasksJson ? JSON.parse(tasksJson) : []

      // タスクを削除
      const filteredSerializedTasks = serializedTasks.filter((t) => t.id !== taskId)

      // 更新したタスクリストを保存
      localStorage.setItem("gantt_tasks", JSON.stringify(filteredSerializedTasks))

      return {
        success: true,
        data: true,
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
      return {
        success: false,
        data: false,
        error: "タスクの削除に失敗しました",
      }
    }
  }

  /**
   * 日付オブジェクトをシリアライズ可能な形式に変換
   */
  private static serializeTask(task: Task): SerializedTask {
    return {
      ...task,
      startDate: task.startDate.toISOString(),
      endDate: task.endDate.toISOString(),
    }
  }

  /**
   * シリアライズされたタスクを元のオブジェクトに戻す
   */
  private static deserializeTask(serializedTask: SerializedTask): Task {
    return {
      ...serializedTask,
      startDate: new Date(serializedTask.startDate),
      endDate: new Date(serializedTask.endDate),
    }
  }
}
