<template>
    <div class="fixed flex items-center w-full border-t border-light-border dark:border-dark-border p-2 px-2 bg-light-bg dark:bg-dark-bg bottom-[56px] h-14"
        @click="goToReply(props.originalPost)">
        <div
            class="flex bg-light-card dark:bg-dark-card text-light-text-secondary dark:text-dark-text-light items-center py-2 px-2 rounded-3xl w-full">
            <div class="flex items-center gap-2 text-sm">
                <Avatar :url="user?.profile_image?.low" size="xs" />
                <p> Escreva a sua resposta</p>
            </div>

        </div>

    </div>
</template>

<script setup>
import Avatar from '@/components/utilities/Avatar.vue'
import { computed } from 'vue'
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
const user = computed(() => store.getters.currentUser)

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