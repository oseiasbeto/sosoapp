<template>
  <div>
    <div v-if="!props.loading" class="w-full">

      <PostCard v-for="post in posts" :key="post._id" v-memo="[post._id, post.updateAt,
      post.likes?.length, post.reposts?.length]" :post-module="props.postsModule" :is-reply="props.isReplies"
        :post="post" />

      <div v-if="currentPage < totalPages" ref="loadTrigger"
        class="flex justify-center my-16">
        <p class="loading-text">Carregando mais...</p>
      </div>
    </div>
    <div v-else class="loading-container flex justify-center my-8">
      <p class="loading-text">Carregando...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useIntersectionObserver } from "@vueuse/core";
import PostCard from './PostCard.vue';

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
  isReplies: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["loadMore"]);
const loadTrigger = ref(null); // Elemento que acionará a API
const currentPage = computed(() => props.pagination.currentPage)
const totalPages = computed(() => props.pagination.totalPages)

const loadMore = async () => {
  if (props.loadingLoadMore || currentPage.value >= totalPages.value) return;
  else {
    const newPage = currentPage.value + 1
    emit("loadMore", newPage)
  }
};

// Observa o último elemento da lista
useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      loadMore();
    }
  }
);
</script>

<style scoped></style>