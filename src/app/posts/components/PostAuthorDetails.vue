<template>
  <div v-if="author !== null" class="flex items-baseline min-w-0 w-full">
    <div 
      class="flex items-baseline min-w-0 max-w-full group" :aria-label="`Perfil de ${author?.name}`">
      <!-- Container principal que fará o truncamento concatenado -->
      <div class="flex items-baseline min-w-0 max-w-full overflow-hidden"
        :class="isViewPost ? '!flex-col text-base leading-5' : 'text-sm'">
        <!-- Nome -->
        <span @click.stop @click="goToProfile(props.author)" class="font-semibold text-light-text-primary dark:text-dark-text-primary truncate text-ellipsis">
          {{ author?.name || 'Nome' }}
        </span>

        <!-- Versão mobile concatenada -->
        <span class="flex text-light-text-secondary dark:text-dark-text-light items-baseline min-w-0 overflow-hidden">
          <span @click.stop @click="goToProfile(props.author)" class="text-gray-500 truncate text-ellipsis" :class="{ 'ml-1': !isViewPost }">
            @{{ author?.username }}
          </span>
          <span v-show="showTime && postCreatedAt !== null" class="text-gray-500 whitespace-nowrap ml-1">
            · {{ formattedTime(props?.postCreatedAt || Date.now()) }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import formattedTime from '@/utils/formatted-time';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const props = defineProps({   
  author: {
    type: Object,
    validator: (author) => '_id' in author && 'name' in author && 'username' in author,
    default: null
  },
  postCreatedAt: {
    type: [String, Date],
    default: null
  },
  isViewPost: {
    type: Boolean,
    default: false
  },
  showTime: {
    type: Boolean,
    default: true
  }
});

const store = useStore()
const router = useRouter()
const route = useRoute()

const goToProfile = (author) => {
  store.dispatch("addNewProfileFromProfiles", author)

  if (route?.params?.user_id !== author?._id) {
    router.push(`/profile/${author?._id}`)
  }
}
</script>

<style scoped>
/* Garante o truncamento concatenado no mobile */
@media (max-width: 640px) {
  .router-link>div {
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