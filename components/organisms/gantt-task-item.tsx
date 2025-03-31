"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { differenceInDays, isSameDay } from "date-fns"
import type { Task } from "@/lib/types"
import { TaskService } from "@/lib/services/task-service"
import { useToast } from "@/hooks/use-toast"
import { TaskBar } from "@/components/atoms/task-bar"
import { TaskCell } from "@/components/atoms/task-cell"
import { TaskActions } from "@/components/molecules/task-actions"
import { TaskEditDialog } from "@/components/molecules/task-edit-dialog"

interface GanttTaskItemProps {
  task: Task
  dates: Date[]
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onDragEnd: (task: Task) => void
  disabled?: boolean
}

export function GanttTaskItem({ task, dates, onUpdate, onDelete, onDragEnd, disabled = false }: GanttTaskItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [originalTask, setOriginalTask] = useState<Task>(task)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const taskRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 日付の範囲内にタスクが存在するかチェック
  const getTaskPosition = () => {
    const startIndex = dates.findIndex(
      (date) => isSameDay(date, task.startDate) || (date > task.startDate && date <= task.endDate),
    )

    const endIndex = dates.findIndex((date) => isSameDay(date, task.endDate))

    const taskDuration = differenceInDays(
      new Date(task.endDate.getTime() + 86400000), // Add one day to include end date
      task.startDate,
    )

    return { startIndex: startIndex >= 0 ? startIndex : 0, endIndex, taskDuration }
  }

  const { startIndex, taskDuration } = getTaskPosition()

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent, type: "move" | "resizeLeft" | "resizeRight") => {
    if (disabled) return

    e.preventDefault()
    e.stopPropagation()

    setOriginalTask({ ...task })
    setDragStartX(e.clientX)

    if (type === "move") {
      setIsDragging(true)
    } else if (type === "resizeLeft") {
      setIsResizingLeft(true)
    } else if (type === "resizeRight") {
      setIsResizingRight(true)
    }
  }

  // マウス移動イベントハンドラ
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizingLeft && !isResizingRight) return

      const cellWidth = containerRef.current?.querySelector(".flex-1")?.clientWidth || 0
      if (cellWidth <= 0) return

      const deltaX = e.clientX - dragStartX
      const daysDelta = Math.round(deltaX / cellWidth)

      if (isDragging) {
        // タスク全体を移動
        const newStartDate = new Date(originalTask.startDate)
        newStartDate.setDate(originalTask.startDate.getDate() + daysDelta)

        const newEndDate = new Date(originalTask.endDate)
        newEndDate.setDate(originalTask.endDate.getDate() + daysDelta)

        onUpdate({
          ...task,
          startDate: newStartDate,
          endDate: newEndDate,
        })
      } else if (isResizingLeft) {
        // 左端をリサイズ（開始日を変更）
        const newStartDate = new Date(originalTask.startDate)
        newStartDate.setDate(originalTask.startDate.getDate() + daysDelta)

        // 開始日が終了日を超えないようにする
        if (newStartDate < originalTask.endDate) {
          onUpdate({
            ...task,
            startDate: newStartDate,
          })
        }
      } else if (isResizingRight) {
        // 右端をリサイズ（終了日を変更）
        const newEndDate = new Date(originalTask.endDate)
        newEndDate.setDate(originalTask.endDate.getDate() + daysDelta)

        // 終了日が開始日より前にならないようにする
        if (newEndDate > originalTask.startDate) {
          onUpdate({
            ...task,
            endDate: newEndDate,
          })
        }
      }
    }

    const handleMouseUp = () => {
      // ドラッグ終了時に現在のタスク状態を親コンポーネントに通知
      if (isDragging || isResizingLeft || isResizingRight) {
        onDragEnd(task)
      }

      setIsDragging(false)
      setIsResizingLeft(false)
      setIsResizingRight(false)
    }

    if (isDragging || isResizingLeft || isResizingRight) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizingLeft, isResizingRight, dragStartX, originalTask, task, onUpdate, onDragEnd])

  // タスク名変更を確定
  const handleRenameConfirm = async (newTitle: string) => {
    setIsRenaming(true)
    try {
      const updatedTask = {
        ...task,
        title: newTitle,
      }

      // APIを通じてタスクを更新
      const result = await TaskService.updateTask(updatedTask)

      if (result) {
        onUpdate(updatedTask)
        // 名前変更後も並べ替えを行う
        onDragEnd(updatedTask)
        setIsRenameDialogOpen(false)

        toast({
          title: "成功",
          description: "タスク名を更新しました",
        })
      } else {
        throw new Error("Failed to rename task")
      }
    } catch (error) {
      console.error("Failed to rename task:", error)
      toast({
        title: "エラー",
        description: "タスク名の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  // タスク削除ハンドラ
  const handleDeleteTask = () => {
    onDelete(task.id)
  }

  return (
    <div className="flex border-b" ref={taskRef}>
      <div className="w-48 min-w-48 p-2 border-r truncate flex items-center justify-between">
        <span>{task.title}</span>
        <TaskActions onEdit={() => setIsRenameDialogOpen(true)} onDelete={handleDeleteTask} disabled={disabled} />
      </div>
      <div className="flex flex-1 relative" ref={containerRef}>
        {dates.map((date, index) => (
          <TaskCell key={index} date={date} index={index} />
        ))}

        {dates.length > 0 && (
          <TaskBar
            task={task}
            startIndex={startIndex}
            taskDuration={taskDuration}
            totalDates={dates.length}
            onMouseDown={handleMouseDown}
            disabled={disabled}
          />
        )}
      </div>

      {/* タスク名変更ダイアログ */}
      <TaskEditDialog
        isOpen={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        initialTitle={task.title}
        onConfirm={handleRenameConfirm}
        isProcessing={isRenaming}
      />
    </div>
  )
}
