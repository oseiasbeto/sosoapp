<template>
    <div class="text-xs text-gray-500 mb-2">
        <router-link @click.stop :to="`/profile/${props.author?.name === user?.name ? user._id : props.author?._id}`"
            class="flex gap-1 items-center w-min whitespace-nowrap">
            <p>{{ props.author?.name === user?.name ? 'Voce' : props.author?.name }} repostou</p>
        </router-link>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const user = computed(() => store.getters.currentUser)

const props = defineProps({
    author: {
        type: Object,
        required: true
    }
})
</script>