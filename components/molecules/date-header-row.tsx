import { DateHeaderCell } from "@/components/atoms/date-header-cell"

interface DateHeaderRowProps {
  dates: Date[]
}

export function DateHeaderRow({ dates }: DateHeaderRowProps) {
  return (
    <div className="flex border-b">
      <div className="w-48 min-w-48 p-2 font-medium border-r">タスク名</div>
      <div className="flex flex-1">
        {dates.map((date, index) => (
          <DateHeaderCell key={index} date={date} index={index} />
        ))}
      </div>
    </div>
  )
}
