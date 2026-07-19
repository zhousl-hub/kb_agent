import { get, del } from './request'

export interface FavoriteItem {
  id: string
  knowledgeId: string
  knowledgeTitle: string
  knowledgeType: string
  summary: string
  source?: string
  createdAt: string
}

export const favoritesApi = {
  getList: (search?: string) =>
    get<FavoriteItem[]>('/v1/favorites', search ? { search } : undefined),

  remove: (id: string) => del<void>(`/v1/favorites/${id}`),
}
