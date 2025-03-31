"use client"

import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TaskActionsProps {
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}

export function TaskActions({ onEdit, onDelete, disabled = false }: TaskActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>名称変更</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>削除</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
