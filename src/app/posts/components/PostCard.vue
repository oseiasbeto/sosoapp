<template>
    <div @click="goToDetails(post)" class="p-4 border-b border-white/20">

        <!--start header-->

        <!--start original repost author tag-->
        <tag-author-repost v-if="post?.is_repost" :author="post?.author" />
        <!--end original repost author tag-->

        <div>
            <!--start author details-->
            <div class="flex flex-col mb-2">
                <span>{{ post?.is_repost ? post?.original_post?.author?.name : post.author.name }}</span>
                <router-link @click.stop class="text-gray-500 w-min"
                    :to="`/profile/${post?.is_repost ? post?.original_post?.author?._id : post.author._id}`">{{
                        post?.is_repost ? post?.original_post?.author?.username : post.author.username
                    }}</router-link>
            </div>
            <!--end author details-->
        </div>
        <!--end header-->

        <!--start body post-->
        <div>
            <!--start content post-->
            <div class="mb-2">
                <p v-if="!post?.is_repost">{{ post?.content }}</p>
                <p v-else>{{ post?.original_post?.content }}</p>
            </div>
            <!--end content post-->
        </div>
        <!--end body post-->

        <!--start footer post-->
        <div @click.stop class="flex items-center gap-5">
            <button
                @click="goToReply(post?.is_repost ? post.original_post : post, post?.is_repost ? post._id : null)">Reply({{
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
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { usePost } from "@/hooks/posts";
import TagAuthorRepost from './TagAuthorRepost.vue';

const router = useRouter()
const route = useRoute()
const store = useStore()

const { toggleLike, loading: loadingToggleLike } = usePost()

const props = defineProps({
    post: {
        type: Object,
        required: true
    },
    isReply: {
        type: Boolean,
        default: false
    }
});

const user = computed(() => store.getters.currentUser)

const isLiked = computed(() => props.post?.is_repost ? props.post.original_post.likes.includes(user.value._id) : props.post?.likes?.includes(user.value._id) || false);
const isReposted = computed(() => props.post?.is_repost ? props.post.original_post.reposts.includes(user.value._id) : props.post?.reposts?.includes(user.value._id) || false);

const likesCount = computed(() => props.post?.is_repost ? props.post.original_post.likes.length : props.post?.likes?.length || 0);
const repliesCount = computed(() => props.post?.is_repost ? props.post.original_post.replies.length : props.post?.replies?.length || 0);
const repostsCount = computed(() => props.post?.is_repost ? props.post.original_post.reposts.length : props.post?.reposts?.length || 0);

const goToDetails = (post) => {
    store.dispatch("setPost", post)
    router.push(`/post/${post._id}`)
}

const handleLike = async (postId, originalRepostId, isRepost) => {
    await toggleLike({
        postId,
        isReply: props.isReply,
        isRepost,
        originalRepostId
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
            isViewPage: false
        }
    })
}

const handleMoreOptions = (originalPost) => {
    router.push({ query: { drawer_show: 'post_more_options' } })
    store.dispatch("openDrawer", {
        name: "post_more_options",
        show: true,
        data: {
            originalPost
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
            ...(props.post?.is_repost && {
                original_repost: originalRepostId
            })
        }
    })
}
</script>