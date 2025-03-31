"use client"

import { useState } from "react"
import { Loader2, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface TaskAddDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (taskName: string, startDate: Date, endDate: Date) => Promise<void>
  isProcessing: boolean
}

export function TaskAddDialog({ isOpen, onOpenChange, onConfirm, isProcessing }: TaskAddDialogProps) {
  const [taskName, setTaskName] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  })
  const [errors, setErrors] = useState({
    taskName: "",
    dates: "",
  })

  const resetForm = () => {
    setTaskName("")
    setStartDate(new Date())
    const newEndDate = new Date()
    newEndDate.setDate(newEndDate.getDate() + 3)
    setEndDate(newEndDate)
    setErrors({ taskName: "", dates: "" })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const validateForm = (): boolean => {
    const newErrors = {
      taskName: "",
      dates: "",
    }

    if (!taskName.trim()) {
      newErrors.taskName = "タスク名を入力してください"
    }

    if (startDate > endDate) {
      newErrors.dates = "開始日は終了日より前である必要があります"
    }

    setErrors(newErrors)
    return !newErrors.taskName && !newErrors.dates
  }

  const handleConfirm = async () => {
    if (validateForm()) {
      await onConfirm(taskName.trim(), startDate, endDate)
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいタスクの追加</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-name">タスク名</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="タスク名を入力"
              className={cn(errors.taskName && "border-red-500")}
              disabled={isProcessing}
              autoFocus
            />
            {errors.taskName && <p className="text-sm text-red-500">{errors.taskName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>開始日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", errors.dates && "border-red-500")}
                    disabled={isProcessing}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(startDate, "yyyy年MM月dd日", { locale: ja })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>終了日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", errors.dates && "border-red-500")}
                    disabled={isProcessing}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(endDate, "yyyy年MM月dd日", { locale: ja })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {errors.dates && <p className="text-sm text-red-500">{errors.dates}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isProcessing}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "追加"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
