<template>
    <div>
        <!--start header post-->
        <div class="mb-2">
            <div class="flex items-center gap-5">
                <button @click="router.back()">Voltar</button>
                <h1>Post</h1>
            </div>
        </div>
        <!--end header post-->

        <!--start body post-->
        <!--start post details-->
        <div>
            <div v-if="!loadingGetPostId">
                <!--start original repost author tag-->
                <tag-author-repost v-if="post?.is_repost" :author="post?.author" />
                <!--end original repost author tag-->

                <!--start author details-->
                <div v-if="post?.is_repost && post?.original_post" class="flex flex-col mb-2">
                    <span>{{ post?.original_post?.author?.name }}</span>
                    <router-link class="text-gray-500 w-min" :to="'/profile/' + post?.original_post.author?._id">{{
                        post?.original_post.author?.username
                    }}</router-link>
                </div>
                <div v-else class="flex flex-col mb-2">
                    <span>{{ post?.author?.name }}</span>
                    <router-link class="text-gray-500 w-min" :to="'/profile/' + post?.author?._id">{{
                        post?.author?.username
                    }}</router-link>
                </div>
                <!--end author details-->

                <!--start reply author tag-->
                <tag-author-reply v-if="post?.is_reply" :author="post?.original_post?.author" />
                <!--end reply author tag-->

                <h1 class="text-2xl">
                    <p v-if="!post?.is_repost">{{ post?.content }}</p>
                    <p v-else>{{ post?.original_post?.content }}</p>
                </h1>
                <hr class="my-2">
                <div class="flex items-center gap-5">
                    <button :disabled="loadingToggleLike" :class="isLiked ? 'text-blue-500' : 'text-white'"
                        @click="handleLike(post?.is_repost ? post.original_post._id : post._id)">Like({{
                            likesCount
                        }})</button>
                    <button
                        @click="handleReply(post?.is_repost ? post.original_post : post, post?.is_repost, post?._id)">Reply({{
                            repliesCount
                        }})</button>
                    <button :class="isReposted ? 'text-green-500' : 'text-white'"
                        @click="handleRepost(post?.is_repost ? post.original_post : post, post._id)">Repost({{
                            repostsCount
                        }})</button>
                </div>
            </div>
            <div v-else>
                <p>Carregando...</p>
            </div>
        </div>
        <!--end post details-->

        <hr class="my-2">
        <!--start replies-->

        <!--start create reply trigger-->
        <create-reply-trigger :original_post="post" />
        <!--end create reply trigger-->


        <!--end replies-->
        <div>
            <post-list :posts="replies.data" :is-replies="true" :loading="loadingGetReplies"
                :loading-load-more="loadingLoadMoreReplies" :pagination="replies.pagination"
                @load-more="_loadMoreReplies" />
        </div>
        <!--end body post-->
    </div>

</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { usePost } from "@/hooks/posts";
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import PostList from '../components/PostList.vue';
import CreateReplyTrigger from '../components/CreateReplyTrigger.vue';
import TagAuthorRepost from '../components/TagAuthorRepost.vue';
import TagAuthorReply from '../components/TagAuthorReply.vue';

const { getPostById, loading: loadingGetPostId, } = usePost()
const { getReplies, loading: loadingGetReplies } = usePost()
const { toggleLike, loading: loadingToggleLike } = usePost()
const { toggleRepost, loading: loadingToggleRepost } = usePost()
const { loadMoreReplies, loading: loadingLoadMoreReplies } = usePost()

const store = useStore()
const route = useRoute()
const router = useRouter()

const post = computed(() => {
    return store.getters.post
})

const user = computed(() => {
    return store.getters.currentUser
})

const replies = computed(() => {
    return store.getters.replies
})

const repliesStore = computed(() => {
    return store.getters.repliesStore
})

const isLiked = computed(() => post.value?.is_repost ? post.value?.original_post.likes.includes(user.value._id) : post.value?.likes?.includes(user.value._id) || false);
const isReposted = computed(() => post.value?.is_repost ? post.value?.original_post.reposts.includes(user.value._id) : post.value?.reposts?.includes(user.value._id) || false);

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

const handleLike = async (postId) => {
    await toggleLike({ postId, isReply: true, isOriginalPost: true })
}

const handleRepost = async (originalPost, originalRepostId) => {
    router.push({ query: { drawer_show: 'repost' } })
    store.dispatch("openDrawer", {
        name: "repost",
        show: true,
        data: {
            originalPost,
            originalRepostId,
            isViewPage: true
        }
    })
}

const handleReply = async (post, isRepost, originalRepostId) => {
    store.dispatch("setOriginalPost", post)
    router.push({
        path: "/composer",
        query: {
            replyto: post._id,
            should_add_reply_from_replies: true,
            ...(isRepost && {
                original_repost: originalRepostId
            })
        }
    })
}

onBeforeRouteLeave((to) => {
    if (to.name !== 'Composer') {
        //store.dispatch("resetReplies")
        //store.dispatch("resetRepliesStore")
    }
})

watch(() => route.params.id, async (newId, oldId) => {
    if (!newId || newId === oldId) return; // Evita chamadas se o ID for inválido ou repetido

    scrollOnTop(); // Rola para o topo ao carregar um novo post
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
    } else {
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