<template>
  <div class="scroll-container">
    <DynamicScroller ref="scroller" :items="props?.posts" :min-item-size="120" class="scroller "
      :style="`padding-bottom: ${bSpace}px;`" :emit-update="true" key-field="_id">
      <!-- Slot para conteúdo ANTES da lista -->
      <template #before>
        <slot name="before-content"></slot>
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
        <div v-if="currentPage < totalPages && !props.loading"
          class="load-more-container bg-dark-error flex justify-center my-4">
          <p class="loading-text">Carregando mais...</p>
        </div>
      </template>
    </DynamicScroller>
    <div v-if="props.loading" class="loading-container flex justify-center my-8">
      <p class="loading-text">Carregando...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import PostCard from './PostCard.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

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
    default: () => ({ currentPage: 1, totalPages: 1 }),
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
const scrollPosition = ref(0);
const currentPage = computed(() => props.pagination.currentPage);
const totalPages = computed(() => props.pagination.totalPages);

// Gerencia o carregamento de mais posts
const handleUpdate = (startIndex, endIndex) => {
  console.log("aki")
  if (
    endIndex >= props.posts.length - 3 &&
    currentPage.value < totalPages.value &&
    !props.loadingLoadMore &&
    !props.loading
  ) {
    const newPage = currentPage.value + 1;
    emit('loadMore', newPage);
  }
};
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
</style>