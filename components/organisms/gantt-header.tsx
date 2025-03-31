"use client"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"

interface GanttHeaderProps {
  title: string
  onAddTask: () => void
  isLoading: boolean
  isProcessing: boolean
}

export function GanttHeader({ title, onAddTask, isLoading, isProcessing }: GanttHeaderProps) {
  return (
    <div className="flex justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button onClick={onAddTask} disabled={isLoading || isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            処理中...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            タスク追加
          </>
        )}
      </Button>
    </div>
  )
}
