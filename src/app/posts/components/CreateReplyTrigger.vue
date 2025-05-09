<template>
    <div @click="goToReply(props.original_post)">
        Escreva o seu comentario
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const props = defineProps(({
    original_post: {
        type: Object,
        required: true
    }
}))

const router = useRouter()
const store = useStore()

const goToReply = (post) => {
    store.dispatch("setOriginalPost", post)
    router.push({
        path: "/composer",
        query: { 
            replyto: post._id, 
            should_add_reply_from_replies: true,
            ...(post?.is_repost && {
                original_repost: post._id
            })
        }
    })
}
</script>