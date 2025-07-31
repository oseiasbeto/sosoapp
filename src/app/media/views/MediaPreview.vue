<template>
    <div class="h-screen w-screen bg-dark-bg">
        {{ media || {} }}
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const media = computed(() => store.getters.currentMedia)

</script>