import { get, post } from './request'

export interface TodoItem {
  id: string
  content: string
  completed: boolean
  createdAt: string
}

export interface RecentDocument {
  id: string
  title: string
  type: string
  knowledgeId: string
  knowledgeName: string
  updatedAt: string
}

export const userApi = {
  getTodos: () => get<TodoItem[]>('/v1/users/todos'),

  createTodo: (content: string) => post<TodoItem>('/v1/users/todos', { content }),

  toggleTodo: (id: string, completed: boolean) =>
    post<void>(`/v1/users/todos/${id}/toggle`, { completed }),

  deleteTodo: (id: string) => post<void>(`/v1/users/todos/${id}/delete`),

  getRecentDocuments: (limit = 5) =>
    get<RecentDocument[]>('/v1/documents/recent', { limit }),
}
