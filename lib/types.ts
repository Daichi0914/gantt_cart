// ドメイン層: エンティティの定義

export interface Task {
  id: string
  title: string
  startDate: Date
  endDate: Date
  color: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface TasksApiResponse extends ApiResponse<Task[]> {}
export interface TaskApiResponse extends ApiResponse<Task> {}
