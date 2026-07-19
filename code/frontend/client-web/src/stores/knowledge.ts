import { defineStore } from 'pinia'
import { ref } from 'vue'
import { knowledgeApi } from '@/api'
import type { KnowledgeSpace, Document } from '@/types'

export const useKnowledgeStore = defineStore('knowledge', () => {
  const knowledgeSpaces = ref<KnowledgeSpace[]>([])
  const currentSpace = ref<KnowledgeSpace | null>(null)
  const documents = ref<Document[]>([])
  const favorites = ref<Document[]>([])
  const recentViewed = ref<Document[]>([])
  const loading = ref(false)

  async function loadKnowledgeSpaces() {
    loading.value = true
    try {
      const data = await knowledgeApi.getSpaces()
      knowledgeSpaces.value = data.items
    } finally {
      loading.value = false
    }
  }

  async function selectSpace(spaceId: string | null) {
    if (!spaceId) {
      currentSpace.value = null
      documents.value = []
      return
    }

    const space = knowledgeSpaces.value.find((s) => s.id === spaceId)
    if (space) {
      currentSpace.value = space
      await loadDocuments(spaceId)
    }
  }

  async function loadDocuments(spaceId: string, page = 1, pageSize = 20) {
    loading.value = true
    try {
      const data = await knowledgeApi.getDocuments(spaceId, page, pageSize)
      documents.value = data.items
    } finally {
      loading.value = false
    }
  }

  async function uploadDocument(spaceId: string, file: File) {
    loading.value = true
    try {
      const doc = await knowledgeApi.uploadDocument(spaceId, file)
      documents.value.unshift(doc)
      return doc
    } finally {
      loading.value = false
    }
  }

  async function deleteDocument(spaceId: string, documentId: string) {
    await knowledgeApi.deleteDocument(spaceId, documentId)
    documents.value = documents.value.filter((d) => d.id !== documentId)
    if (currentSpace.value?.id === spaceId) {
      const space = knowledgeSpaces.value.find((s) => s.id === spaceId)
      if (space) {
        space.documentCount = Math.max(0, space.documentCount - 1)
      }
    }
  }

  function toggleFavorite(docId: string) {
    const docIndex = documents.value.findIndex((d) => d.id === docId)
    const favIndex = favorites.value.findIndex((d) => d.id === docId)

    if (favIndex !== -1) {
      favorites.value.splice(favIndex, 1)
    } else if (docIndex !== -1) {
      favorites.value.push(documents.value[docIndex])
    }
    localStorage.setItem('client-knowledge-favorites', JSON.stringify(favorites.value))
  }

  function isFavorite(docId: string): boolean {
    return favorites.value.some((d) => d.id === docId)
  }

  async function loadFavorites() {
    const stored = localStorage.getItem('client-knowledge-favorites')
    if (stored) {
      try {
        favorites.value = JSON.parse(stored)
      } catch {
        favorites.value = []
      }
    }
  }

  async function loadRecentViewed() {
    const stored = localStorage.getItem('client-knowledge-recent')
    if (stored) {
      try {
        recentViewed.value = JSON.parse(stored)
      } catch {
        recentViewed.value = []
      }
    }
  }

  function addToRecentViewed(doc: Document) {
    recentViewed.value = recentViewed.value.filter((d) => d.id !== doc.id)
    recentViewed.value.unshift(doc)
    if (recentViewed.value.length > 10) {
      recentViewed.value = recentViewed.value.slice(0, 10)
    }
    localStorage.setItem('client-knowledge-recent', JSON.stringify(recentViewed.value))
  }

  function clearCurrentSpace() {
    currentSpace.value = null
    documents.value = []
  }

  return {
    knowledgeSpaces,
    currentSpace,
    documents,
    favorites,
    recentViewed,
    loading,
    loadKnowledgeSpaces,
    selectSpace,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    toggleFavorite,
    isFavorite,
    loadFavorites,
    loadRecentViewed,
    addToRecentViewed,
    clearCurrentSpace,
  }
}, {
  persist: {
    key: 'client-knowledge',
    storage: localStorage,
    pick: ['currentSpace', 'favorites', 'recentViewed'],
  },
})