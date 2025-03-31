interface TaskCellProps {
  date: Date
  index: number
}

export function TaskCell({ date, index }: TaskCellProps) {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  return <div key={index} className={`flex-1 border-r ${isWeekend ? "bg-gray-100" : ""}`} />
}
