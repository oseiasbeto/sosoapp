<template>
  <div class="scroll-container">
    <DynamicScroller ref="scroller" :items="props?.posts" :min-item-size="120" class="scroller "
      :style="`padding-bottom: ${bSpace}px;`" :emit-update="true" key-field="_id">
      <!-- Slot para conteúdo ANTES da lista -->
      <template #before>
        <slot name="before-content"></slot>
        <!--loading-->
        <div v-if="props.loading">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </template>

      <template v-if="!props.loading" v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active"
          :size-dependencies="[item._id, item.updatedAt, item.likes?.length, item.reposts?.length]" :data-index="index"
          class="scroller-item">
          <PostCard :post-module="props.postsModule" :is-reply="props.isReplies" :post="item" />
        </DynamicScrollerItem>
      </template>
      <!-- Slot para conteúdo após a lista -->

      <template #after>
        <div ref="loadTrigger" v-if="props?.pagination?.hasMore || props.loadingLoadMore && !props.loading"
          class="load-more-container flex justify-center my-4">
          <div
            class="w-6 h-6 border-2 border-solid border-primary border-t-light-bg dark:border-t-dark-bg rounded-full animate-spin">
          </div>
        </div>
      </template>
    </DynamicScroller>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import PostCard from './PostCard.vue';
import { useIntersectionObserver } from "@vueuse/core";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import PostSkeleton from './PostSkeleton.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true,
    default: () => [],
  },
  postsModule: {
    type: String,
    default: 'feed',
  },
  pagination: {
    type: Object,
    default: () => ({ page: 1, hasMore: false, totalPages: 1 }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingLoadMore: {
    type: Boolean,
    default: false,
  },
  bSpace: {
    type: Number,
    default: 0
  },
  isReplies: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['loadMore']);
const scroller = ref(null);
const loadTrigger = ref(null); // Elemento que acionará a API
const currentPage = computed(() => props.isReplies ? props.pagination.currentPage : props.pagination.page);

// Gerencia o carregamento de mais posts
const handleUpdate = () => {
  if (
    props?.pagination?.hasMore &&
    !props?.loadingLoadMore &&
    !props?.loading
  ) {
    const newPage = currentPage.value + 1;
    emit('loadMore', newPage);
  }
};

// Observa o último elemento da lista
useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      handleUpdate();
    }
  }
);
</script>

<style scoped>
.scroll-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  /* Evita barras de rolagem externas */
}

.scroller {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE e Edge */
}

.scroller::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari */
}

.scroller-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}

@keyframes breathe {

  0%,
  100% {
    opacity: 0.3;
    border-width: 1px;
  }

  50% {
    opacity: 1;
    border-width: 2px;
  }
}
</style>