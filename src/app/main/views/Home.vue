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
            :is-replies="false" 
            :loading="loadingGetFeedPosts"
            posts-module="feed" 
            :b-space="64" 
            :loading-load-more="loadingLoadMorePosts"
            :pagination="feedPosts?.pagination" 
            @load-more="_loadMorePosts" 
            />
            <!--end post list-->

        </div>
        <!---end body-->

        <!--start footer-->
        <btn-plus @on-press="goToPost('feed')">
            <svg viewBox="0 0 24 24" stroke="#fff" fill="none" width="29" height="29" class="r-jwli3a">
                <path
                    d="M 20 9 L 20 16 C 20 18.209 18.209 20 16 20 L 8 20 C 5.791 20 4 18.209 4 16 L 4 8 C 4 5.791 5.791 4 8 4 L 15 4"
                    stroke-width="1.5"></path>
                <line stroke-linecap="round" x1="10" y1="14" x2="18.5" y2="5.5" stroke-width="2.25"></line>
                <line stroke-linecap="round" x1="20.5" y1="3.5" x2="21" y2="3" stroke-width="2.25"></line>
            </svg>
        </btn-plus>
        <!--end footer-->
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { usePost } from '@/hooks/posts';
import CreatePostTrigger from '@/app/posts/components/CreatePostTrigger.vue';
import PostList from '@/app/posts/components/PostList.vue';
import BtnPlus from '@/components/btns/BtnPlus.vue';
import { useRouter } from 'vue-router';

const store = useStore()
const router = useRouter()

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

const goToPost = (postModule) => {
    router.push({
        path: '/composer',
        query: {
            post_module: postModule
        }
    })
}

onMounted(async () => {
    if (!feedPosts.value) {
        await getFeedPosts({
            page: 1,
            limit: 10
        })
    }
})
</script>