<template>
    <div @click="goToDetails(post)" ref="postCardRef" class="p-4 border-b border-white/20">

        <!--start header-->

        <!--start original repost author tag-->
        <tag-author-repost v-if="post?.is_repost" :author="post?.author" />
        <!--end original repost author tag-->

        <div>
            <!--start author details-->
            <author-post-details :author="post?.is_repost ? post?.original_post?.author : post.author" />
            <!--end author details-->
        </div>
        <!--end header-->

        <!--start body post-->
        <div>
            <!--start content post-->
            <div class="mb-2">
                <p>{{ post.is_repost ? post?.original_post?.content : post?.content }}</p>
            </div>
            <!--end content post-->
        </div>
        <!--end body post-->

        <!--start footer post-->
        <div @click.stop class="flex items-center gap-5">
            <button @click="goToReply(post, post.originalRepostId)">Reply({{
                repliesCount }})
            </button>

            <button :disabled="loadingToggleLike" :class="isLiked ? 'text-blue-500' : 'text-white'"
                @click="handleLike(post?.is_repost ? post.original_post._id : post._id, post._id, post?.is_repost)">Like({{
                    likesCount
                }})
            </button>

            <button :class="isReposted ? 'text-green-500' : 'text-white'"
                @click="handleRepost(post?.is_repost ? post.original_post : post)">Repost({{ repostsCount
                }})
            </button>

            <button @click="handleMoreOptions(post)">Mais
            </button>
        </div>
        <!--end footer post-->
    </div>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { usePost } from "@/hooks/posts";
import TagAuthorRepost from './TagAuthorRepost.vue';
import AuthorPostDetails from './AuthorPostDetails.vue';

const router = useRouter()
const route = useRoute()
const store = useStore()

const { toggleLike, loading: loadingToggleLike } = usePost()

const props = defineProps({
    post: {
        type: Object,
        required: true
    },
    postModule: String,
    isReply: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['update:height']);

const user = computed(() => store.getters.currentUser)

const isLiked = computed(() => props.post?.is_repost ? props.post.original_post.likes.includes(user.value._id) : props.post?.likes?.includes(user.value._id) || false);
const isReposted = computed(() => props.post?.is_repost ? props.post.original_post.reposts.includes(user.value._id) : props.post?.reposts?.includes(user.value._id) || false);

const likesCount = computed(() => props.post?.is_repost ? props.post.original_post.likes.length : props.post?.likes?.length || 0);
const repliesCount = computed(() => props.post?.is_repost ? props.post.original_post.replies.length : props.post?.replies?.length || 0);
const repostsCount = computed(() => props.post?.is_repost ? props.post.original_post.reposts.length : props.post?.reposts?.length || 0);

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

const measureHeight = () => {
    if (postCardRef.value) {
        const height = postCardRef.value.offsetHeight;
        emit('update:height', height);
    }
};

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

const handleRepost = (originalPost) => {
    router.push({ query: { drawer_show: 'repost' } })
    store.dispatch("openDrawer", {
        name: "repost",
        show: true,
        data: {
            originalPost,
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

const goToReply = (post, originalRepostId) => {
    store.dispatch("setOriginalPost", post)
    router.push({
        path: "/composer",
        query: {
            replyto: post._id,
            add_reply_from: props.isReply ? 'original_reply' : 'original_post',
            post_module: props.postModule
        }
    })
}

onMounted(() => {
    measureHeight();
    const observer = new ResizeObserver(measureHeight);
    if (postCardRef.value) {
        observer.observe(postCardRef.value);
    }
    return () => observer.disconnect();
})
</script>