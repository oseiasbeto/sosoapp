<template>
    <button @click="goToPost(postModule)">
        Oque estas pensando?
    </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
    postModule: {
        type: String,
        required: true
    }
})

const router = useRouter()

const goToPost = (postModule) => {
    router.push({
        path: '/composer',
        query: {
            post_module: postModule
        }
    })
}
</script>