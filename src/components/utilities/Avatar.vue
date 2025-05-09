<script setup>
const props = defineProps({
    url: {
        type: String,
        required: true
    },
    costum: {
        type: String,
        default: "w-12 h-12 rounded-full overflow-hidden"
    }
})

</script>

<template>
    <div :class="props.costum">
        <img class="w-full h-full object-cover" v-lazy="props.url" >
    </div>
</template>