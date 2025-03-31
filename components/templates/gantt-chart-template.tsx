"use client"

import { useState, useEffect } from "react"
import { addDays, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns"
import { ja } from "date-fns/locale"
import type { Task } from "@/lib/types"
import { TaskService } from "@/lib/services/task-service"
import { useToast } from "@/hooks/use-toast"
import { GanttHeader } from "@/components/organisms/gantt-header"
import { GanttBody } from "@/components/organisms/gantt-body"
import { TaskAddDialog } from "@/components/molecules/task-add-dialog"

export function GanttChartTemplate() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [daysToShow, setDaysToShow] = useState<number>(14)
  const [dates, setDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
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
    setIsProcessing(true)
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
      setIsProcessing(false)
    }
  }

  // タスク削除
  const handleTaskDelete = async (taskId: string) => {
    setIsProcessing(true)
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
      setIsProcessing(false)
    }
  }

  // タスク追加ダイアログを開く
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true)
  }

  // タスク追加
  const handleAddTask = async (taskName: string, startDate: Date, endDate: Date) => {
    setIsProcessing(true)
    try {
      const newTaskData = {
        title: taskName,
        startDate: startDate,
        endDate: endDate,
        color: TaskService.getRandomColor(),
      }

      // APIを通じて新しいタスクを作成
      const newTask = await TaskService.createTask(newTaskData)

      if (newTask) {
        // 新しいタスクを追加して並べ替え
        const updatedTasks = [...tasks, newTask]
        setTasks(TaskService.sortTasksByStartDate(updatedTasks))

        // ダイアログを閉じる
        setIsAddDialogOpen(false)

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
      setIsProcessing(false)
    }
  }

  return (
    <div className="overflow-x-auto">
      <GanttHeader
        title="プロジェクトスケジュール"
        onAddTask={handleOpenAddDialog}
        isLoading={isLoading}
        isProcessing={isProcessing}
      />

      <GanttBody
        tasks={tasks}
        dates={dates}
        isLoading={isLoading}
        isProcessing={isProcessing}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onTaskDragEnd={handleTaskDragEnd}
      />

      <TaskAddDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onConfirm={handleAddTask}
        isProcessing={isProcessing}
      />
    </div>
  )
}
