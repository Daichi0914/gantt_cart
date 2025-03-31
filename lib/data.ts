import { addDays } from "date-fns"
import type { Task } from "./types"

const today = new Date()

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "要件定義",
    startDate: today,
    endDate: addDays(today, 3),
    color: "#3b82f6", // blue
  },
  {
    id: "task-2",
    title: "設計",
    startDate: addDays(today, 4),
    endDate: addDays(today, 7),
    color: "#10b981", // green
  },
  {
    id: "task-3",
    title: "開発",
    startDate: addDays(today, 8),
    endDate: addDays(today, 12),
    color: "#f59e0b", // amber
  },
  {
    id: "task-4",
    title: "テスト",
    startDate: addDays(today, 10),
    endDate: addDays(today, 13),
    color: "#ef4444", // red
  },
]
