<template>
    <router-link @click.stop class="text-gray-500 w-min whitespace-nowrap flex flex-col mb-2" :to="`/profile/${author?._id}`">
        <span class="text-white">{{ author?.name }}</span>
        <span>{{ author?.username }}</span>
    </router-link>
</template>

<script setup>
const props = defineProps({
    author: {
        type: Object,
        required: true
    }
})
</script>