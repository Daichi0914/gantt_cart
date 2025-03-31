"use client"

import type React from "react"

import { useRef } from "react"
import type { Task } from "@/lib/types"

interface TaskBarProps {
  task: Task
  startIndex: number
  taskDuration: number
  totalDates: number
  onMouseDown: (e: React.MouseEvent, type: "move" | "resizeLeft" | "resizeRight") => void
  disabled?: boolean
}

export function TaskBar({ task, startIndex, taskDuration, totalDates, onMouseDown, disabled = false }: TaskBarProps) {
  const barRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={barRef}
      className={`absolute top-1 bottom-1 rounded flex items-center justify-center text-white text-xs ${
        disabled ? "opacity-70" : "cursor-move"
      }`}
      style={{
        left: `${(startIndex / totalDates) * 100}%`,
        width: `${(taskDuration / totalDates) * 100}%`,
        backgroundColor: task.color,
      }}
      onMouseDown={(e) => onMouseDown(e, "move")}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 ${disabled ? "" : "cursor-ew-resize"}`}
        onMouseDown={(e) => onMouseDown(e, "resizeLeft")}
      />
      <span className="px-2 truncate">{task.title}</span>
      <div
        className={`absolute right-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 ${disabled ? "" : "cursor-ew-resize"}`}
        onMouseDown={(e) => onMouseDown(e, "resizeRight")}
      />
    </div>
  )
}
