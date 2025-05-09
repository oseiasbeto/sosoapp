<template>
    <div class="py-2">
        {{ props.originalPost.content }}
        <div class="flex items-center gap-1">
            <p>Respondendo a: </p>
            <span v-if="user.username === props.originalPost.author.username">si mesmo</span>
            <router-link class="text-blue-400" v-else :to="'/profile/' + props.originalPost.author._id"> {{ '@' + props.originalPost.author.username
                }}</router-link>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const user = computed(() => {
    return store.getters.currentUser
})

const props = defineProps({
    originalPost: {
        type: Object,
        required: true
    }
})
</script>