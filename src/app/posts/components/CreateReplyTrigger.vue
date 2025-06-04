<template>
    <div @click="goToReply(props.originalPost)">
        Escreva o seu comentario 
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const props = defineProps(({
    originalPost: {
        type: Object,
        required: true
    },
    postModule: {
        type: String,
        default: 'feed'
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
            post_module: props.postModule
        }
    })
}
</script>