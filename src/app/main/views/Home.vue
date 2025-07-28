<template>
    <div class="mb-14 overflow-hidden">
        <!--start post list-->
        <post-list :posts="homePosts?.posts || []" :is-replies="false" :loading="loadingPosts || loadingPostsGlobal"
            :posts-module="activeTab" :b-space="64" :loading-load-more="loadingLoadMorePosts"
            :pagination="homePosts?.pagination" @load-more="_loadMorePosts" ref="postListComponent"
            @on-scroll="handleScroll">

            <template #before-content>
                <div class="h-[90px]">
                    <div class="bg-light-bg z-[999] w-full fixed transition-transform top-0 dark:bg-dark-bg"
                    :class="{'translate-y-[-92px]': hideHeader}"
                    >
                        <div class="flex relative py-2 pt-3 px-4 justify-between items-center">
                            <div class="absolute">
                                <Avatar :url="user?.profile_image?.low || undefined" size="sm" />
                            </div>

                            <div @click="handleHideHeader()" class="mx-auto">
                                <Logo />
                            </div>

                            <div class="absolute right-4">
                                <button
                                    class="flex items-center justify-center rounded-full active:bg-light-card active:dark:bg-dark-card w-[34px] h-[34px] text-light-text-secondary dark:text-dark-text-light">

                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path
                                            d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <Tabs ref="tabsComponent" v-model="activeTab" :tabs="tabs" />
                    </div>
                </div>
            </template>
        </post-list>
        <!--end post list-->

        <!--start footer-->
        <btn-plus @on-press="goToPost(`profile_feed_${user?._id}`)">
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
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { usePost } from '@/hooks/posts';
import PostList from '@/app/posts/components/PostList.vue';
import BtnPlus from '@/components/btns/BtnPlus.vue';
import { useRouter } from 'vue-router';
import Tabs from '@/components/base/Tabs.vue';
import Logo from '@/components/utilities/Logo.vue';
import Avatar from '@/components/utilities/Avatar.vue';

const store = useStore()
const router = useRouter()

const { getPosts, loading: loadingPosts } = usePost();
const { loadMorePosts, loading: loadingLoadMorePosts } = usePost();

const activeTab = ref('feed')
const hideHeader = ref(false)

const tabs = ref([
    { label: "Descobrir", value: 'feed' },
    { label: "Seguindo", value: 'following' },
])

// Cache de índices para melhor performance
const tabIndices = ref({
    feed: null,
    following: null
})

const user = computed(() => store.getters.currentUser)
const posts = computed(() => store.getters.posts)

const homePosts = computed(() => {
    const index = tabIndices.value[activeTab.value]
    return index !== null ? posts.value[index] : null
})

const tabsComponent = ref(null)
const postListComponent = ref(null)
const loadingPostsGlobal = ref(true)

const updateTabIndices = () => {
    tabIndices.value.feed = store.getters.posts.findIndex(p => p.byId === 'feed')
    tabIndices.value.following = store.getters.posts.findIndex(p => p.byId === 'following')
}

const _loadMorePosts = async (newPage) => {
    try {
        await loadMorePosts({
            page: newPage,
            tab: activeTab.value,
            totalItems: homePosts?.value?.pagination?.total,
            limit: 10
        })
        await nextTick()
    } catch (err) {
        console.error('Failed to load more posts:', err);
        // Tratamento de erro adicional pode ser adicionado aqui
    }
}

const handleHideHeader = () => {
    hideHeader.value = true
}

const setScrollPosition = async (position) => {
    await nextTick(); // Espera a atualização do DOM
    if (postListComponent.value?.setScrollTop) {
        postListComponent.value.setScrollTop(position);
    } else {
        console.error('setScrollTop method not available on postListComponent');
    }
};

const goToPost = (postModule) => {
    router.push({
        path: '/composer',
        query: {
            post_module: postModule
        }
    })
}

const handleScroll = (value) => {

    if(value > 130) {
        hideHeader.value = true
    } else {
        hideHeader.value = false
    }

    if (posts?.value?.length) {
        const byId = activeTab.value
        store.dispatch("setScrollTopFromPosts", {
            byId,
            value
        })
    } else return
}

watch(() => activeTab.value, async (newTab, oldTab) => {
    if (newTab === oldTab || loadingPostsGlobal.value) return;

    const cachedPosts = posts.value.find(p => p.byId === newTab);
    if (cachedPosts) {
        // Dados já em cache, apenas ajusta o scroll
        await nextTick();
        setScrollPosition(cachedPosts.scroll_top || 0);
    } else {
        // Se não há cache, busca os posts
        await getPosts({ page: 1, limit: 10, tab: newTab });
        setScrollPosition(0); // Reseta o scroll
    }
});


onMounted(async () => {
    try {
        await Promise.all([
            getPosts({ page: 1, limit: 10, tab: 'feed' }),
            getPosts({ page: 1, limit: 10, tab: 'following' })
        ])
        updateTabIndices() // Atualiza índices após carregar mais posts
    } catch (error) {
        console.error('Error loading posts:', error)
    } finally {
        loadingPostsGlobal.value = false // Garante que o loading seja desativado mesmo se houver erro
    }
})
</script>