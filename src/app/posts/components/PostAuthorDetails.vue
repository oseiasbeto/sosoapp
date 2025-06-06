<template>
  <div class="flex items-baseline min-w-0 w-full">
    <router-link
      @click.stop
      :to="`/profile/${author?._id}`"
      class="flex items-baseline min-w-0 max-w-full group"
      :aria-label="`Perfil de ${author?.name}`"
    >
      <!-- Container principal que fará o truncamento concatenado -->
      <div class="flex text-sm items-baseline min-w-0 max-w-full overflow-hidden">
        <!-- Nome -->
        <span class="font-semibold text-light-text-primary dark:text-dark-text-primary truncate text-ellipsis">
          {{ author?.name }}
        </span>
        
        <!-- Versão mobile concatenada -->
        <span class="flex text-sm text-light-text-secondary dark:text-dark-text-light items-baseline min-w-0 overflow-hidden">
          <span class="text-gray-500 truncate text-ellipsis ml-1">
            @{{ author?.username }}
          </span>
          <span class="text-gray-500 whitespace-nowrap ml-1">
            · {{ formattedTime(postCreatedAt) }}
          </span>
        </span>
      </div>
    </router-link>
  </div>
</template>
<script setup>
import formattedTime from '@/utils/formatted-time';
import { ref, computed, onMounted, onUpdated, onBeforeUnmount } from 'vue';

const props = defineProps({
  author: {
    type: Object,
    required: true,
    validator: (author) => '_id' in author && 'name' in author && 'username' in author,
  },
  postCreatedAt: {
    type: [String, Date],
    required: true,
  },
  // Opcional: largura máxima do container pai
  parentMaxWidth: {
    type: String,
    default: '100%'
  }
});
</script>

<style scoped>
/* Garante o truncamento concatenado no mobile */
@media (max-width: 640px) {
  .router-link > div {
    display: flex;
    width: 100%;
  }
  
  .router-link span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .router-link span:first-child {
    flex-shrink: 1;
    min-width: 0;
  }
  
  .router-link span:not(:first-child) {
    flex-shrink: 999;
    min-width: fit-content;
  }
}
</style>