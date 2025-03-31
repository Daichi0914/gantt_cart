"use client"

import { Loader2 } from "lucide-react"
import type { Task } from "@/lib/types"
import { DateHeaderRow } from "@/components/molecules/date-header-row"
import { GanttTaskItem } from "@/components/organisms/gantt-task-item"

interface GanttBodyProps {
  tasks: Task[]
  dates: Date[]
  isLoading: boolean
  isProcessing: boolean
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskDragEnd: (task: Task) => void
}

export function GanttBody({
                            tasks,
                            dates,
                            isLoading,
                            isProcessing,
                            onTaskUpdate,
                            onTaskDelete,
                            onTaskDragEnd,
                          }: GanttBodyProps) {
  return (
    <div className="min-w-[800px]">
      {/* ヘッダー部分 - 日付表示 */}
      <DateHeaderRow dates={dates} />

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
            <GanttTaskItem
              key={task.id}
              task={task}
              dates={dates}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              onDragEnd={onTaskDragEnd}
              disabled={isProcessing}
            />
          ))}
        </div>
      )}
    </div>
  )
}
