<template>
    <div class="h-screen w-screen fixed inset-0 bg-[#000] flex items-center justify-center z-50">
        <div v-if="!loadingGetMedia && media?.type && !hasError" class="w-full h-full">
            <ImagesMedia v-if="media?.type !== 'video'" :initialIndex="media?.index" :media="media?.items" />
            <PlayerVideo v-if="media?.type === 'video'" :video="media?.items[0]" />
        </div>
        <div v-if="loadingGetMedia">
            <p>Carregando...</p>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import ImagesMedia from '../components/ImagesMedia.vue';
import PlayerVideo from '../components/PlayerVideo.vue';
import { useRoute } from 'vue-router';
import { useMedia } from '@/hooks/media';

const store = useStore()
const route = useRoute()

const media = computed(() => store.getters.currentMedia)
const mediaId = computed(() => route.params.media_id)
const mediaType = computed(() => route.query.type)
const initialIndex = computed(() => route.query.initial_index)
const hasError = ref(false)

const { getMediaByPostId, loading: loadingGetMedia } = useMedia()

onMounted(async () => {
    if (!media?.value?.type) {
        await getMediaByPostId({
            id: mediaId?.value,
            type: mediaType?.value,
            index: initialIndex?.value
        }).catch(err => {
            hasError.value = true
        })
    } else return
})
</script>