<template>
    <div class="text-[13px] font-semibold mb-0.5">

        <div @click.stop @click="goToProfile(props.author?.name === user?.name ? user : props.author)"
            class="flex gap-1 items-center w-min whitespace-nowrap text-light-text-secondary dark:text-dark-text-light">
            <div class="w-[38px]"></div>
            <svg fill="none" width="13" height="13" class="mr-[0.5px]" viewBox="0 0 24 24">
                <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                    d="M17.957 2.293a1 1 0 1 0-1.414 1.414L17.836 5H6a3 3 0 0 0-3 3v3a1 1 0 1 0 2 0V8a1 1 0 0 1 1-1h11.836l-1.293 1.293a1 1 0 0 0 1.414 1.414l2.47-2.47a1.75 1.75 0 0 0 0-2.474l-2.47-2.47ZM20 12a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3H6.164l1.293 1.293a1 1 0 1 1-1.414 1.414l-2.47-2.47a1.75 1.75 0 0 1 0-2.474l2.47-2.47a1 1 0 0 1 1.414 1.414L6.164 17H18a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1Z">
                </path>
            </svg>
            <p class="truncate text-ellipsis">Repostado por {{ props.author?.name === user?.name ? 'voce' :
                props.author?.name }}</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore()
const router = useRouter()
const route = useRoute()
const user = computed(() => store.getters.currentUser)

const props = defineProps({
    author: {
        type: Object,
        required: true
    }
})

const goToProfile = (author) => {
    store.dispatch("addNewProfileFromProfiles", author)

    if (route?.params?.user_id !== author?._id) {
        router.push(`/profile/${author?._id}`)
    }

}
</script>