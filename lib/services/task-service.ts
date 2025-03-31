// アプリケーション層: ユースケースとビジネスロジック

import type { Task } from "@/lib/types"
import { TaskApiClient } from "@/lib/api/task-api"
import { initialTasks } from "@/lib/data"

/**
 * タスクサービス
 * タスク関連のビジネスロジックを管理するクラス
 */
export class TaskService {
  /**
   * すべてのタスクを取得
   */
  static async fetchTasks(): Promise<Task[]> {
    const response = await TaskApiClient.getTasks()

    // データが空の場合は初期データを設定
    if (response.success && response.data.length === 0) {
      // 初期データをローカルストレージに保存
      for (const task of initialTasks) {
        await TaskApiClient.createTask(task)
      }
      return initialTasks
    }

    return response.success ? response.data : []
  }

  /**
   * 新しいタスクを作成
   */
  static async createTask(task: Omit<Task, "id">): Promise<Task | null> {
    const response = await TaskApiClient.createTask(task)
    return response.success ? response.data : null
  }

  /**
   * タスクを更新
   */
  static async updateTask(task: Task): Promise<Task | null> {
    const response = await TaskApiClient.updateTask(task)
    return response.success ? response.data : null
  }

  /**
   * タスクを削除
   */
  static async deleteTask(taskId: string): Promise<boolean> {
    const response = await TaskApiClient.deleteTask(taskId)
    return response.success
  }

  /**
   * タスクを開始日でソート
   */
  static sortTasksByStartDate(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }

  /**
   * ランダムな色を生成
   */
  static getRandomColor(): string {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#06b6d4", // cyan
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}
