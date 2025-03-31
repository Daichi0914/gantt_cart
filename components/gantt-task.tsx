"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { differenceInDays, isSameDay } from "date-fns"
import { MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import type { Task } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TaskService } from "@/lib/services/task-service"
import { useToast } from "@/hooks/use-toast"

interface GanttTaskProps {
  task: Task
  dates: Date[]
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onDragEnd: (task: Task) => void
  disabled?: boolean
}

export default function GanttTask({ task, dates, onUpdate, onDelete, onDragEnd, disabled = false }: GanttTaskProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [originalTask, setOriginalTask] = useState<Task>(task)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState(task.title)
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
  const handleRenameConfirm = async () => {
    if (newTaskTitle.trim()) {
      setIsRenaming(true)
      try {
        const updatedTask = {
          ...task,
          title: newTaskTitle.trim(),
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
  }

  return (
    <div className="flex border-b" ref={taskRef}>
      <div className="w-48 min-w-48 p-2 border-r truncate flex items-center justify-between">
        <span>{task.title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <button className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => {
                setNewTaskTitle(task.title)
                setIsRenameDialogOpen(true)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>名称変更</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>削除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-1 relative" ref={containerRef}>
        {dates.map((date, index) => (
          <div
            key={index}
            className={`flex-1 border-r ${date.getDay() === 0 || date.getDay() === 6 ? "bg-gray-100" : ""}`}
          />
        ))}

        {dates.length > 0 && (
          <div
            className={`absolute top-1 bottom-1 rounded flex items-center justify-center text-white text-xs ${
              disabled ? "opacity-70" : "cursor-move"
            }`}
            style={{
              left: `${(startIndex / dates.length) * 100}%`,
              width: `${(taskDuration / dates.length) * 100}%`,
              backgroundColor: task.color,
            }}
            onMouseDown={(e) => handleMouseDown(e, "move")}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 ${
                disabled ? "" : "cursor-ew-resize"
              }`}
              onMouseDown={(e) => handleMouseDown(e, "resizeLeft")}
            />
            <span className="px-2 truncate">{task.title}</span>
            <div
              className={`absolute right-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 ${
                disabled ? "" : "cursor-ew-resize"
              }`}
              onMouseDown={(e) => handleMouseDown(e, "resizeRight")}
            />
          </div>
        )}
      </div>

      {/* タスク名変更ダイアログ */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスク名の変更</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="タスク名を入力"
              className="w-full"
              autoFocus
              disabled={isRenaming}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRenaming) {
                  handleRenameConfirm()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} disabled={isRenaming}>
              キャンセル
            </Button>
            <Button onClick={handleRenameConfirm} disabled={isRenaming}>
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
