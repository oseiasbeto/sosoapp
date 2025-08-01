<template>
    <div class="h-screen w-screen fixed inset-0 bg-[#000] flex items-center justify-center z-50">
        <ImagesMediaPreview v-if="media?.type !== 'video'" :initialIndex="media?.index" :media="media?.items"/>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ImagesMediaPreview from '../components/ImagesMediaPreview.vue';

const store = useStore()

const media = computed(() => store.getters.currentMedia)

</script>