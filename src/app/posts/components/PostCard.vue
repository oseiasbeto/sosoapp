<template>
    <div @click="goToDetails(post)" ref="postCardRef"
        class="p-4 pb-2.5 mb-0.5 shrink-0 border-b border-light-border dark:border-dark-border">
        <!--start flags-->
        <!--start original repost author tag-->
        <tag-author-repost v-if="post?.is_repost" :author="post?.author" />
        <!--end original repost author tag-->
        <!--end flags-->
        <!--<p>{{ props.totalItems }}{{ props?.index }}</p>-->
    
        <div class="flex">
            <div id="left-part" class="pl-1 pr-3">
                <avatar
                    :url="post?.is_repost ? post?.original_post?.author?.profile_image?.low : post.author?.profile_image?.low || null"
                    alt-text="Foto" />
            </div>
            <div id="right-part" class="min-w-0 flex-1 flex-shrink-0">
                <!--start header-->
                <div ref="parent" class="w-full min-w-0 max-w-full overflow-hidden flex-shrink-0">
                    <!--start author details-->
                    <author-post-details
                        :post-created-at="post?.is_repost ? post?.original_post?.created_at : post?.created_at"
                        :author="post?.is_repost ? post?.original_post?.author : post?.author" />
                    <!--end author details-->
                </div>
                <!--end header-->

                <!--start body post-->
                <div>
                    <!--start content post-->
                    <div class="mb-2">
                        <post-text :text="post.is_repost ? post?.original_post?.content : post?.content" />
                    </div>
                    <!--end content post-->

                    <!--start media-->
                    <PostCardMedia :media="post.is_repost? post?.original_post?.media : post?.media" />
                    <!--end media-->
                </div>
                <!--end body post-->

                <!--start footer post-->
                <post-reactions :likes-count="likesCount" :replies-count="repliesCount" :reposts-count="repostsCount"
                    @like-post="handleLike(post?.is_repost ? post.original_post._id : post._id, post._id, post?.is_repost)"
                    :loading-toggle-like="loadingToggleLike" @reply-post="goToReply(post, post?.is_repost)"
                    @repost="handleRepost(post?.is_repost ? post.original_post : post, post?.is_repost)"
                    @open-more="handleMoreOptions(post)" :has-liked="hasLiked" :has-reposted="hasReposted" />
                <!--end footer post-->
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { usePost } from "@/app/posts/posts.hook";
import TagAuthorRepost from './TagAuthorRepost.vue';
import AuthorPostDetails from './PostAuthorDetails.vue';
import PostText from './PostText.vue';
import PostReactions from './PostReactions.vue';
import Avatar from '@/components/utilities/Avatar.vue';
import PostCardMedia from '../../media/components/PostCardMedia.vue';

const router = useRouter()
const route = useRoute()
const store = useStore()

const { toggleLike, loading: loadingToggleLike } = usePost()

const props = defineProps({
    post: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        default: -1
    },
    totalItems: {
        type: Number,
        required: true
    },
    postModule: String,
    isReply: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['update:height']);

const parent = ref(null);
const user = computed(() => store.getters.currentUser)

const hasLiked = computed(() => props.post?.is_repost ? props.post?.original_post?.likes.includes(user.value._id) : props?.post?.likes?.includes(user.value._id) || false);

const hasReposted = computed(() => props.post?.is_repost ? props?.post?.original_post?.reposts.includes(user.value._id) : props.post?.reposts?.includes(user.value._id) || false);

const likesCount = computed(() => props.post?.is_repost ? props.post?.original_post?.likes?.length : props.post?.likes?.length || 0);

const repliesCount = computed(() => props.post?.is_repost ? props?.post.original_post?.replies?.length : props.post?.replies?.length || 0);

const repostsCount = computed(() => props.post?.is_repost ? props?.post?.original_post?.reposts.length : props.post?.reposts?.length || 0);

/* 
const isLastPost = computed(() => {
    // Supondo que você tenha acesso ao total de posts e ao índice atual
    return props.index === props.totalItems - 1 && props.totalItems  > 1; // ou outra lógica para determinar o último
});*/

const goToDetails = (post) => {
    store.dispatch("setPost", post.is_repost ? {
        ...post.original_post,
        originalRepostId: post._id
    } : post)
    router.push({
        path: `/post/${post.is_repost ? post.original_post?._id : post._id}`,
        query: {
            post_module: props.postModule
        }
    })
}

const postCardRef = ref(null);

const handleLike = async (postId, originalRepostId, isRepost) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    } else {
        console.log('API de vibração não suportada.');
    }
    await toggleLike({
        postId,
        isReply: props.isReply,
        isRepost,
        originalRepostId,
        postModule: props.postModule
    })
}

const handleRepost = (originalPost, isRepost) => {
    router.push({ query: { drawer_show: 'repost' } })
    store.dispatch("openDrawer", {
        name: "repost",
        show: true,
        data: {
            originalPost,
            isRepost,
            isPost: !props.isReply,
            isViewPage: false,
            postModule: props.postModule
        }
    })
}

const handleMoreOptions = (originalPost) => {
    router.push({ query: { drawer_show: 'post_more_options' } })
    store.dispatch("openDrawer", {
        name: "post_more_options",
        show: true,
        data: {
            originalPost,
            postModule: props.postModule
        }
    })
}

const goToReply = (post, isRepost) => {
    store.dispatch("setOriginalPost", post)
    router.push({
        path: "/composer",
        query: {
            replyto: post._id,
            ...(isRepost && {
                is_repost: isRepost,
            }),
            add_reply_from: props.isReply ? 'original_reply' : 'original_post',
            post_module: props.postModule
        }
    })
}
</script>