<script setup lang="ts">
interface Knowledge {
  id: string
  name: string
  description: string
  documentCount: number
  updatedAt: string
}

defineProps<{
  data: Knowledge
}>()

const emit = defineEmits<{
  click: [id: string]
}>()
</script>

<template>
  <div
    class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
    @click="emit('click', data.id)"
  >
    <h3 class="font-medium text-gray-900 truncate">{{ data.name }}</h3>
    <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ data.description }}</p>
    <div class="flex items-center justify-between mt-3 text-xs text-gray-400">
      <span>{{ data.documentCount }} 篇文档</span>
      <span>{{ data.updatedAt }}</span>
    </div>
  </div>
</template>