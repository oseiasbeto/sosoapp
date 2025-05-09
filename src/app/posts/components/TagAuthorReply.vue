<template>
    <div class="text-xs text-gray-500 mb-2">
        <div class="flex gap-1 items-center">
            <p>Em resposta a:</p>
            <router-link v-if="props.author?._id !== user?._id" class="text-blue-400" :to="'/profile/' + props.author?._id">@{{ props.author?.username }}
            </router-link>
            <span v-else>Voce</span>
        </div>
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
        default: {}
    }
})
</script>