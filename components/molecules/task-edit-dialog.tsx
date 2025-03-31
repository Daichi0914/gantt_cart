"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TaskEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialTitle: string
  onConfirm: (newTitle: string) => Promise<void>
  isProcessing: boolean
}

export function TaskEditDialog({ isOpen, onOpenChange, initialTitle, onConfirm, isProcessing }: TaskEditDialogProps) {
  const [title, setTitle] = useState(initialTitle)

  const handleConfirm = () => {
    if (title.trim()) {
      onConfirm(title.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスク名の変更</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タスク名を入力"
            className="w-full"
            autoFocus
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isProcessing) {
                handleConfirm()
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
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
  )
}
