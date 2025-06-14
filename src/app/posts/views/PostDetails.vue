<template>
    <div>

        <!--end replies-->
        <div>
            <post-list 
            :b-space="110" 
            :posts="replies?.data || []" 
            :is-replies="true" 
            :loading="loadingGetReplies"
            :post-module="postModule" 
            :loading-load-more="loadingLoadMoreReplies" 
            :pagination="replies.pagination"
            @load-more="_loadMoreReplies">

                <template #before-content>
                    <!--start header post-->
                    <Navbar :title="'Postagem'" />
                    <!--end header post-->

                    <!--start body post-->
                    <!--start post details-->
                    <div class="p-4 mt-14 border-b border-light-border dark:border-dark-border">
                        <div v-if="!loadingGetPostId">
                            <div
                                class="w-full min-w-0 mb-3 flex items-center gap-2.5 max-w-full overflow-hidden flex-shrink-0">
                                <!--start avatar-->
                                <Avatar :src="post?.author?.profile_image?.low" alt-text="Foto" />
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

                            <hr class="my-2">
                            <div class="flex items-center gap-5">
                                <button @click="handleReply(post)">Reply({{
                                    repliesCount
                                    }})</button>
                                <button :disabled="loadingToggleLike" :class="isLiked ? 'text-blue-500' : 'text-white'"
                                    @click="handleLike(post._id, post.originalRepostId)">Like({{
                                        likesCount
                                    }})
                                </button>

                                <button :class="isReposted ? 'text-green-500' : 'text-white'"
                                    @click="handleRepost(post, post._id)">Repost({{
                                        repostsCount
                                    }})</button>
                            </div>
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
import { computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { usePost } from "@/hooks/posts";
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import PostList from '../components/PostList.vue';
import CreateReplyTrigger from '../components/CreateReplyTrigger.vue';
import TagAuthorRepost from '../components/TagAuthorRepost.vue';
import TagAuthorReply from '../components/TagAuthorReply.vue';
import AuthorPostDetails from '../components/PostAuthorDetails.vue';
import PostText from '../components/PostText.vue';
import Navbar from '@/components/base/Navbar.vue';
import Avatar from '@/components/utilities/Avatar.vue';

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

const repliesStore = computed(() => store.getters.repliesStore)
const postModule = computed(() => route.query.post_module)
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

        console.log(replies)
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