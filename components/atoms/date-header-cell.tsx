import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface DateHeaderCellProps {
  date: Date
  index: number
}

export function DateHeaderCell({ date, index }: DateHeaderCellProps) {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  return (
    <div
      key={index}
      className={`flex-1 p-2 text-center text-sm font-medium border-r ${isWeekend ? "bg-gray-100" : ""}`}
    >
      <div>{format(date, "M/d", { locale: ja })}</div>
      <div className="text-xs text-gray-500">{format(date, "E", { locale: ja })}</div>
    </div>
  )
}
