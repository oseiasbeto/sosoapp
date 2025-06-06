<template>
    <div class="mb-14 overflow-hidden">
        <!--start pull refresh-->

        <!--end pull refresh-->

        <!---start header
        <div>
            <router-link to="/profile">
                Meu perfil
            </router-link>
            <router-link to="/settings">
                Configuracoes
            </router-link>
        </div>
-->
        <div>
            <!--start tabs -->
            <!--end tabs -->
        </div>
        <!---end header-->

        <!---start body-->
        <div>
            <div class="my-2">
                <!--start create post trigger
                <create-post-trigger post-module="feed" />-->
                <!--end create post trigger-->
            </div>


            <!--start post list-->
            <post-list 
            :posts="feedPosts?.posts || []" 
            :is-replies="false" :loading="loadingGetFeedPosts"
            posts-module="feed" 
            :b-space="56"
            :loading-load-more="loadingLoadMorePosts" 
            :pagination="feedPosts?.pagination"
            @load-more="_loadMorePosts" 
            />
            <!--end post list-->

        </div>
        <!---end body-->
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { usePost } from '@/hooks/posts';
import CreatePostTrigger from '@/app/posts/components/CreatePostTrigger.vue';
import PostList from '@/app/posts/components/PostList.vue';

const store = useStore()
const { getFeedPosts, loading: loadingGetFeedPosts } = usePost();
const { loadMorePosts, loading: loadingLoadMorePosts } = usePost();

const user = computed(() => store.getters.currentUser)
const posts = computed(() => store.getters.posts)
const feedPosts = computed(() => posts.value.find(m => m.byId === 'feed'))
const isRefreshing = ref(false);

const _loadMorePosts = async (newPage) => {
    await loadMorePosts({
        page: newPage,
        limit: 10
    })
}

const onRefresh = async () => {
    isRefreshing.value = true
    await getFeedPosts({
        page: 1,
        limit: 10
    }).finally(() => {
        isRefreshing.value = false
    })
};


onMounted(async () => {
    console.log("aki")
    if (!feedPosts.value) {
        await getFeedPosts({
            page: 1,
            limit: 10
        })
    }
})
</script>