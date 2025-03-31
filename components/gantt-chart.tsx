"use client"

import { useState, useEffect } from "react"
import { format, addDays, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns"
import { ja } from "date-fns/locale"
import GanttTask from "./gantt-task"
import type { Task } from "@/lib/types"
import { TaskService } from "@/lib/services/task-service"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GanttChart() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [daysToShow, setDaysToShow] = useState<number>(14)
  const [dates, setDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 日付範囲の計算
  useEffect(() => {
    const start = startOfWeek(startDate, { locale: ja })
    const end = endOfWeek(addDays(start, daysToShow), { locale: ja })
    const dateRange = eachDayOfInterval({ start, end })
    setDates(dateRange)
  }, [startDate, daysToShow])

  // タスクの初期読み込み
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true)
      try {
        const fetchedTasks = await TaskService.fetchTasks()
        setTasks(TaskService.sortTasksByStartDate(fetchedTasks))
      } catch (error) {
        console.error("Failed to load tasks:", error)
        toast({
          title: "エラー",
          description: "タスクの読み込みに失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [toast])

  // タスク更新（ドラッグ中）- 並べ替えなし
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === updatedTask.id) {
          return {
            ...updatedTask,
            startDate: new Date(updatedTask.startDate),
            endDate: new Date(updatedTask.endDate),
          }
        }
        return task
      }),
    )
  }

  // ドラッグ終了時のタスク更新 - 並べ替えあり
  const handleTaskDragEnd = async (updatedTask: Task) => {
    setIsSaving(true)
    try {
      // APIを通じてタスクを更新
      await TaskService.updateTask(updatedTask)

      // 更新後のタスクを取得して並べ替え
      const updatedTasks = tasks.map((task) => {
        if (task.id === updatedTask.id) {
          return {
            ...updatedTask,
            startDate: new Date(updatedTask.startDate),
            endDate: new Date(updatedTask.endDate),
          }
        }
        return task
      })

      // 開始日でタスクを並べ替え
      setTasks(TaskService.sortTasksByStartDate(updatedTasks))
    } catch (error) {
      console.error("Failed to update task:", error)
      toast({
        title: "エラー",
        description: "タスクの更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // タスク削除
  const handleTaskDelete = async (taskId: string) => {
    setIsSaving(true)
    try {
      // APIを通じてタスクを削除
      const success = await TaskService.deleteTask(taskId)

      if (success) {
        // 削除後のタスクリストを更新
        const updatedTasks = tasks.filter((task) => task.id !== taskId)
        setTasks(TaskService.sortTasksByStartDate(updatedTasks))

        toast({
          title: "成功",
          description: "タスクを削除しました",
        })
      } else {
        throw new Error("Failed to delete task")
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // タスク追加
  const handleAddTask = async () => {
    setIsSaving(true)
    try {
      const newTaskData = {
        title: `新しいタスク ${tasks.length + 1}`,
        startDate: new Date(),
        endDate: addDays(new Date(), 3),
        color: TaskService.getRandomColor(),
      }

      // APIを通じて新しいタスクを作成
      const newTask = await TaskService.createTask(newTaskData)

      if (newTask) {
        // 新しいタスクを追加して並べ替え
        const updatedTasks = [...tasks, newTask]
        setTasks(TaskService.sortTasksByStartDate(updatedTasks))

        toast({
          title: "成功",
          description: "新しいタスクを追加しました",
        })
      } else {
        throw new Error("Failed to create task")
      }
    } catch (error) {
      console.error("Failed to add task:", error)
      toast({
        title: "エラー",
        description: "タスクの追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">プロジェクトスケジュール</h2>
        <Button onClick={handleAddTask} disabled={isLoading || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            "タスク追加"
          )}
        </Button>
      </div>

      <div className="min-w-[800px]">
        {/* ヘッダー部分 - 日付表示 */}
        <div className="flex border-b">
          <div className="w-48 min-w-48 p-2 font-medium border-r">タスク名</div>
          <div className="flex flex-1">
            {dates.map((date, index) => (
              <div
                key={index}
                className={`flex-1 p-2 text-center text-sm font-medium border-r ${
                  date.getDay() === 0 || date.getDay() === 6 ? "bg-gray-100" : ""
                }`}
              >
                <div>{format(date, "M/d", { locale: ja })}</div>
                <div className="text-xs text-gray-500">{format(date, "E", { locale: ja })}</div>
              </div>
            ))}
          </div>
        </div>

        {/* タスク一覧 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">タスクを読み込み中...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex justify-center items-center py-10 text-muted-foreground">
            タスクがありません。「タスク追加」ボタンをクリックして新しいタスクを作成してください。
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <GanttTask
                key={task.id}
                task={task}
                dates={dates}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onDragEnd={handleTaskDragEnd}
                disabled={isSaving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
