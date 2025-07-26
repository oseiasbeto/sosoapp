<template>
    <div>
        <!--end replies-->
        <div>
            <post-list :b-space="110" :posts="replies?.data || []" :is-replies="true" ref="postListComponent"
                :loading="loadingGetReplies" :post-module="postModule" :loading-load-more="loadingLoadMoreReplies"
                :pagination="replies.pagination" @load-more="_loadMoreReplies" @on-scroll="handleScroll">

                <template #before-content>
                    <!--start header post-->
                    <Navbar :title="post?.is_reply ? 'Resposta' : 'Postagem'" />
                    <!--end header post-->


                    <!--start body post-->
                    <!--start post details-->
                    <div class="p-4 pb-[10px] mt-14 border-b border-light-border dark:border-dark-border">
                        <div v-if="!loadingGetPostId">
                            <div
                                class="w-full min-w-0 mb-3 flex items-center gap-2.5 max-w-full overflow-hidden flex-shrink-0">
                                <!--start avatar-->
                                <Avatar :url="post?.author?.profile_image?.low" alt-text="Foto" />
                                <!--end avatar-->

                                <!--start author details-->
                                <author-post-details :is-view-post="true" :show-time="false" :author="post.author" />
                                <!--end author details-->
                            </div>


                            <!--start reply author tag-->
                            <tag-author-reply v-if="post?.is_reply" :author="post?.original_post?.author" />
                            <!--end reply author tag-->

                            <!--start post text-->
                            <PostText :text="post?.content" :is-bigger="true" />
                            <!--end post text-->

                            <!--start created at-->
                            <div class="text-xs mt-[10px] text-light-text-secondary dark:text-dark-text-secondary">
                                <p>{{ formatFullDate(post?.created_at || Date.now()) }}</p>
                            </div>
                            <!--end created at-->

                            <!--start counts-->
                            <div
                                class="flex items-center gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary border-y py-3 my-3 mb-2 border-light-border dark:border-dark-border">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-light-text-primary font-semibold dark:text-dark-text-primary"> {{
                                        repostsCount }} </span>
                                    <span>{{ repostsCount === 1 ? 'Repostagem' : 'Repostagens' }}</span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-light-text-primary font-semibold dark:text-dark-text-primary"> {{
                                        likesCount }} </span>
                                    <span>{{ likesCount === 1 ? 'Curtida' : 'Curtidas' }}</span>
                                </div>

                            </div>
                            <!--end counts-->

                            <!--start reactions btns-->
                            <div class="flex justify-between ml-[-3px] items-center gap-5">
                                <button @click="handleReply(post)"
                                    class="flex items-center gap-1 p-[5px] text-light-text-secondary text-sm dark:text-dark-text-secondary">
                                    <svg fill="none" width="22" viewBox="0 0 24 24" height="22">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M2.002 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H12.28l-4.762 2.858A1 1 0 0 1 6.002 21v-2h-1a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v1.234l3.486-2.092a1 1 0 0 1 .514-.142h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-14Z">
                                        </path>
                                    </svg>
                                    <span v-show="repliesCount > 0" class="text-inherit text-[15px]">{{ repliesCount
                                    }}</span>
                                </button>
                                <button
                                    class="flex items-center gap-1 p-[5px] text-light-text-secondary text-sm dark:text-dark-text-secondary"
                                    :class="{ '!text-reposted': hasReposted }" @click="handleRepost(post, post._id)">
                                    <svg fill="none" width="22" viewBox="0 0 24 24" height="22">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M17.957 2.293a1 1 0 1 0-1.414 1.414L17.836 5H6a3 3 0 0 0-3 3v3a1 1 0 1 0 2 0V8a1 1 0 0 1 1-1h11.836l-1.293 1.293a1 1 0 0 0 1.414 1.414l2.47-2.47a1.75 1.75 0 0 0 0-2.474l-2.47-2.47ZM20 12a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3H6.164l1.293 1.293a1 1 0 1 1-1.414 1.414l-2.47-2.47a1.75 1.75 0 0 1 0-2.474l2.47-2.47a1 1 0 0 1 1.414 1.414L6.164 17H18a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1Z">
                                        </path>
                                    </svg>
                                    <span v-show="repostsCount > 0" class="text-inherit text-[15px]">{{ repostsCount
                                    }}</span>
                                </button>
                                <button
                                    class="flex items-center gap-1 p-[5px] text-light-text-secondary text-sm dark:text-dark-text-secondary"
                                    :class="{ '!text-liked': hasLiked }" :disabled="loadingToggleLike"
                                    @click="handleLike(post._id, post.originalRepostId)">
                                    <svg v-if="!hasLiked" fill="none" width="22" viewBox="0 0 24 24" height="22"
                                        style="pointer-events: none;">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M16.734 5.091c-1.238-.276-2.708.047-4.022 1.38a1 1 0 0 1-1.424 0C9.974 5.137 8.504 4.814 7.266 5.09c-1.263.282-2.379 1.206-2.92 2.556C3.33 10.18 4.252 14.84 12 19.348c7.747-4.508 8.67-9.168 7.654-11.7-.541-1.351-1.657-2.275-2.92-2.557Zm4.777 1.812c1.604 4-.494 9.69-9.022 14.47a1 1 0 0 1-.978 0C2.983 16.592.885 10.902 2.49 6.902c.779-1.942 2.414-3.334 4.342-3.764 1.697-.378 3.552.003 5.169 1.286 1.617-1.283 3.472-1.664 5.17-1.286 1.927.43 3.562 1.822 4.34 3.764Z">
                                        </path>
                                    </svg>
                                    <svg v-else fill="none" width="22" viewBox="0 0 24 24" height="22" class="r-84gixx">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M12.489 21.372c8.528-4.78 10.626-10.47 9.022-14.47-.779-1.941-2.414-3.333-4.342-3.763-1.697-.378-3.552.003-5.169 1.287-1.617-1.284-3.472-1.665-5.17-1.287-1.927.43-3.562 1.822-4.34 3.764-1.605 4 .493 9.69 9.021 14.47a1 1 0 0 0 .978 0Z">
                                        </path>
                                    </svg>
                                    <span v-show="likesCount > 0" class="text-inherit text-[15px]">{{ likesCount
                                    }}</span>
                                </button>
                                <button
                                    class="flex items-center gap-1 p-[5px] text-light-text-secondary text-sm dark:text-dark-text-secondary">
                                    <svg fill="none" width="22" viewBox="0 0 24 24" height="22">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M20 13.75a1 1 0 0 1 1 1V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3.25a1 1 0 1 1 2 0V18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.25a1 1 0 0 1 1-1ZM12 3a1 1 0 0 1 .707.293l4.5 4.5a1 1 0 1 1-1.414 1.414L13 6.414v8.836a1 1 0 1 1-2 0V6.414L8.207 9.207a1 1 0 1 1-1.414-1.414l4.5-4.5A1 1 0 0 1 12 3Z">
                                        </path>
                                    </svg>
                                </button>
                                <button
                                    class="flex items-center gap-1 p-[5px] text-light-text-secondary text-sm dark:text-dark-text-secondary">
                                    <svg fill="none" width="22" viewBox="0 0 24 24" height="22">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M2 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm16 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                            <!--end reactions btns-->
                        </div>
                        <div v-else>
                            <p>Carregando...</p>
                        </div>
                    </div>
                </template>
            </post-list>
        </div>
        <!--end body post-->

        <!--start create reply trigger-->
        <create-reply-trigger :original-post="post" :post-module="postModule" />
        <!--end create reply trigger-->
    </div>

</template>

<script setup>
import { computed, watch, onMounted, nextTick, ref } from 'vue';
import { useStore } from 'vuex';
import { usePost } from "@/hooks/posts";
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { formatFullDate } from "../utils/dateFormatter";
import PostList from '../components/PostList.vue';
import CreateReplyTrigger from '../components/CreateReplyTrigger.vue';
import TagAuthorReply from '../components/TagAuthorReply.vue';
import AuthorPostDetails from '../components/PostAuthorDetails.vue';
import PostText from '../components/PostText.vue';
import Navbar from '@/components/base/Navbar.vue';
import Avatar from '@/components/utilities/Avatar.vue';

const { getPostById, loading: loadingGetPostId, } = usePost()
const { getReplies, loading: loadingGetReplies } = usePost()
const { toggleLike, loading: loadingToggleLike } = usePost()

const { loadMoreReplies, loading: loadingLoadMoreReplies } = usePost()
loadingGetPostId.value = true
const store = useStore()
const route = useRoute()
const router = useRouter()


const post = computed(() => {
    return store.getters.post
})

const user = computed(() => {
    return store.getters.currentUser
})

const postListComponent = ref(null);

const setScrollPosition = async (position) => {
    await nextTick(); // Espera a atualização do DOM
    if (postListComponent.value?.setScrollTop) {
        postListComponent.value.setScrollTop(position);
    } else {
        console.error('setScrollTop method not available on postListComponent');
    }
};

const replies = computed(() => {
    return store.getters.replies
})

const repliesStore = computed(() => store.getters.repliesStore)

const postModule = computed(() => route.query.post_module)

const hasLiked = computed(() => post.value?.is_repost ? post.value?.original_post.likes.includes(user.value._id) : post.value?.likes?.includes(user.value._id) || false);

const hasReposted = computed(() => post.value?.is_repost ? post.value?.original_post.reposts.includes(user.value._id) : post.value?.reposts?.includes(user.value._id) || false);

const likesCount = computed(() => post.value?.is_repost ? post.value?.original_post.likes.length : post.value?.likes?.length || 0);
const repliesCount = computed(() => post.value?.is_repost ? post.value?.original_post.replies.length : post.value?.replies?.length || 0);
const repostsCount = computed(() => post.value?.is_repost ? post.value?.original_post.reposts.length : post.value?.reposts?.length || 0);
const scrollOnTop = () => {
    window.scrollTo(0, 0)
}

const resetReplies = () => {
    store.dispatch("resetReplies")
}

const getStoreOriginalPost = (post_id) => {
    return repliesStore.value.find(d => d.original_post._id == post_id) || null;
}

const _loadMoreReplies = async (newPage) => {
    await loadMoreReplies({
        original_post: post.value,
        page: newPage,
        isLoad: true,
        limit: 10
    })
}

const handleLike = async (postId, originalRepostId) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    } else {
        console.log('API de vibração não suportada.');
    }
    await toggleLike({ postId, originalRepostId, postModule: postModule.value, isReply: true, isOriginalPost: true })
}

const handleRepost = async (originalPost, originalRepostId) => {
    router.push({ query: { drawer_show: 'repost' } })
    store.dispatch("openDrawer", {
        name: "repost",
        show: true,
        data: {
            originalPost,
            originalRepostId,
            postModule: postModule.value,
            isViewPage: true
        }
    })
}

const handleReply = async (post) => {
    store.dispatch("setOriginalPost", post)
    router.push({
        path: "/composer",
        query: {
            replyto: post._id,
            should_add_reply_from_replies: true,
            post_module: postModule.value
        }
    })
}

const handleScroll = (value) => {
    const id = route.params.id
    const originalPostStore = getStoreOriginalPost(id) || null;

    if (originalPostStore) {
        const originalPostId = originalPostStore?.original_post?._id
        store.dispatch("setScrollTopRepliesStore", {
            originalPostId,
            value
        })
    }
}

onBeforeRouteLeave((to) => {
    if (to.name !== 'Composer') {
        //store.dispatch("resetReplies")
        //store.dispatch("resetRepliesStore")
    }
})

watch(() => route.params.id, async (newId, oldId) => {
    if (!newId || newId === oldId) return; // Evita chamadas se o ID for inválido ou repetido

    resetReplies()

    // Obtém o Original post armazenado localmente, se existir
    const originalPostStore = getStoreOriginalPost(newId) || null;

    if (originalPostStore) {
        // Se o Post já foi visualizado, carrega do cache local
        const post = originalPostStore.original_post

        const replies = originalPostStore.replies

        store.dispatch('setPost', post);
        store.dispatch("setReplies", {
            original_post: post,
            replies: replies.data,
            page: replies.pagination.currentPage,
            totalPages: replies.pagination.totalPages,
            total: replies.pagination.total
        });

        const scrollTop = originalPostStore?.scroll_top || 0
        setScrollPosition(scrollTop)
    } else {
        await nextTick()
        setScrollPosition(0)
        if (!post.value?._id) {
            await getPostById(route.params.id).then(async () => {
                await getReplies({
                    original_post: post.value,
                    page: 1,
                    limit: 10
                })
            })
        } else {
            if (post.value?._id !== route.params.id) {
                await getPostById(route.params.id).then(async () => {
                    await getReplies({
                        original_post: post.value,
                        page: 1,
                        limit: 10
                    })
                })
            } else {
                await getReplies({
                    original_post: post.value,
                    page: 1,
                    limit: 10
                })
            }
        }
    }
})

onMounted(async () => {
    scrollOnTop()
    if (!post.value?._id) {
        await getPostById(route.params.id).then(async () => {
            await getReplies({
                original_post: post.value,
                page: 1,
                limit: 10
            })
        })
    } else {
        loadingGetPostId.value = false
        const postId = route.params.id
        const originalPostId = replies.value.lastRequest.originalPostId
        let existingPostStore;

        if (repliesStore.value.length) {
            existingPostStore = repliesStore.value.find(r => r.original_post._id === postId);
        }

        if (!existingPostStore) {
            await getReplies({
                lastRequestPostId: originalPostId,
                original_post: post.value,
                page: 1,
                limit: 10,
                rafs: true
            })
        } else {
            store.dispatch("setReplies", {
                replies: existingPostStore.replies.data,
                original_post: existingPostStore.original_post,
                page: existingPostStore.replies.pagination.currentPage,
                totalPages: existingPostStore.replies.pagination.totalPages
            })
        }
    }
})
</script>