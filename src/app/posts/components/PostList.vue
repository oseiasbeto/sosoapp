<template>
    <div>
        <div v-if="!loading" ref="postsContainer" class="w-full overflow-hidden">
            <post-card v-memo="[post._id, post.updateAt]" v-if="posts?.length" v-for="post in posts" :key="post._id" :is-reply="isReplies" :post="post" />

            <div v-if="currentPage < totalPages" ref="loadTrigger" class="flex justify-center my-8">
                <p>Carregando novos posts...</p>
            </div>
        </div>

        <div v-else>
            <p>Carregando...</p>
        </div>
    </div>

</template>

<script setup>
import { computed, ref } from 'vue';
import PostCard from './PostCard.vue';
import { useIntersectionObserver } from "@vueuse/core";

const props = defineProps({
    posts: {
        type: Array,
        required: true
    },
    pagination: {
        type: Object
    },
    loading: {
        type: Boolean,
        default: false
    },
    loadingLoadMore: {
        type: Boolean,
        default: false
    },
    isReplies: {
        type: Boolean,
        required: true
    }
});

const currentPage = computed(() => props?.pagination?.currentPage || 1);
const totalPages = computed(() => props?.pagination?.totalPages || 1);
const loadTrigger = ref(null);

const emit = defineEmits(["loadMore"]);

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