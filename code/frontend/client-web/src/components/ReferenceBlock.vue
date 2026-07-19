<script setup lang="ts">
interface Reference {
  id: string
  title: string
  content: string
  score: number
  source?: string
}

defineProps<{
  references: Reference[]
}>()
</script>

<template>
  <div v-if="references?.length" class="mt-3 pt-3 border-t">
    <div class="text-xs text-gray-400 mb-2">参考来源</div>
    <div class="space-y-2">
      <div
        v-for="ref in references"
        :key="ref.id"
        class="text-xs bg-gray-50 rounded p-2"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">{{ ref.title }}</span>
          <span class="text-blue-500">{{ (ref.score * 100).toFixed(0) }}%</span>
        </div>
        <p class="text-gray-500 mt-1 line-clamp-2">{{ ref.content }}</p>
      </div>
    </div>
  </div>
</template>