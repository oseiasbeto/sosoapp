<template>
    <div class="mb-14">
        <!---start header-->
        <div>
            <router-link to="/profile">
                Meu perfil
            </router-link>
            <router-link to="/settings">
                Configuracoes
            </router-link>
        </div>

        <div>
            <!--start tabs -->
            <!--end tabs -->
        </div>
        <!---end header-->

        <!---start body-->
        <div>
            <div class="my-2">
                <!--start create post trigger-->
                <create-post-trigger />
                <!--end create post trigger-->
            </div>


            <!--start post list-->
            <post-list :posts="posts.data" :is-replies="false" :loading="loadingGetFeedPosts"
                :loading-load-more="loadingLoadMorePosts" :pagination="posts.pagination" @load-more="_loadMorePosts" />
            <!--end post list-->

        </div>
        <!---end body-->
    </div>

</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { usePost } from '@/hooks/posts';
import CreatePostTrigger from '@/app/posts/components/CreatePostTrigger.vue';
import PostList from '@/app/posts/components/PostList.vue';

const store = useStore()
const { getFeedPosts, loading: loadingGetFeedPosts } = usePost();
const { loadMorePosts, loading: loadingLoadMorePosts } = usePost();

const user = computed(() => {
    return store.getters.currentUser
})

const posts = computed(() => {
    return store.getters.posts
})

const _loadMorePosts = async (newPage) => {
    await loadMorePosts({
        page: newPage,
        limit: 10
    })
}

const onTouchStart = (event) => {
    console.log(event)
}

const onTouchMove = (event) => {
    console.log(event)
}

const onTouchEnd = (event) => {
    console.log(event)
}

onMounted(async () => {
    if (!posts.value.data.length) {
        await getFeedPosts({
            page: 1,
            limit: 10
        })
    }
})

const openModal = (name, data) => {
    store.dispatch("openModal", {
        show: true,
        name,
        data
    })
}
</script>