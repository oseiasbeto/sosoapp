<template>
  <div class="scroll-container overflow-hidden">
    <DynamicScroller @scroll="handleScrollEvent" 
      ref="scroller" 
      :items="props?.notifications" 
      :min-item-size="120"
      class="scroller" 
      :style="{
        'padding-bottom': `${bSpace}px`
      } " 
      key-field="_id">
      <!-- Slot para conteúdo ANTES da lista -->
      <template #before>
        <slot name="before-content"></slot>
        <!--loading-->
        <div v-if="props.loading">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      </template>

      <template v-if="!props.loading && props.notifications?.length" v-slot="{ item, index, active }">
        <DynamicScrollerItem 
         :item="item" 
         :active="active"
         :size-dependencies="[item._id, item.updatedAt]" 
         :data-index="index"
         class="scroller-item">
          <NotificationCard 
          :totalItems="props.pagination.total" 
          :index="index" 
          :notification="item" 
          />
        </DynamicScrollerItem>
      </template>
      <!-- Slot para conteúdo após a lista -->

      <template #after>
        <div ref="loadTrigger" v-if="props?.pagination?.hasMore || props.loadingLoadMore && !props.loading"
          class="load-more-container flex justify-center my-5">
          <div
            class="w-5 h-5 border-2 border-solid border-primary border-t-light-bg dark:border-t-dark-bg rounded-full animate-spin">
          </div>
        </div>
      </template>
    </DynamicScroller>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import NotificationCard from './NotificationCard.vue';
import { useIntersectionObserver } from "@vueuse/core";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import NotificationSkeleton from './NotificationSkeleton.vue';

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
    default: () => [],
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
  }
});

const emit = defineEmits(['loadMore', 'onScroll']);
const scroller = ref(null);
const loadTrigger = ref(null);

const currentPage = computed(() => props.pagination.page);

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


const handleScrollEvent = (event) => {
  const scrollElement = event.target;

  if (scrollElement) {
    emit('onScroll', scrollElement.scrollTop)
  }
};

const setScrollTop = (position) => {
  const scrollElement = scroller.value?.$el;
  if (scrollElement) {
    scrollElement.scrollTop = position;
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

// Expõe a função para o componente pai
defineExpose({
  setScrollTop
});
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