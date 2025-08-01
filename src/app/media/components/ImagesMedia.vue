<template>
    <div ref="emblaRef" class="embla w-full h-full">
        <div class="embla__container flex h-full">
            <div v-for="(item, index) in props?.media" :key="item?.public_id"
                class="embla__slide flex-[0_0_100%] flex items-center justify-center">
                <img v-lazy="item?.type === 'video' ? item?.thumbnail : item?.url" :alt="`Mídia ${index + 1} do post`"
                    class="object-contain max-w-full max-h-full panzoom-image" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onUnmounted } from "vue"
import emblaCarouselVue from 'embla-carousel-vue'

const props = defineProps({
    media: {
        type: Array,
        required: true
    },
    initialIndex: {
        type: Number,
        default: 0
    }
})

const [emblaRef, emblaApi] = emblaCarouselVue({
    loop: false,
    dragFree: false,
    align: 'center',
    startIndex: props.initialIndex,
    speed: 2, // Aumenta a velocidade do deslize (padrão é 10)
    duration: 0, // Remove animações de transição
    containScroll: false, // Evita contenção extra do scroll
    dragThreshold: 0
})



onUnmounted(() => {
    if (emblaApi.value) emblaApi.value.destroy();
});
</script>

<style>
.embla {
    overflow: hidden;
}

.embla__container {
    display: flex;
    height: 100%;
}

.embla__slide {
    flex: 0 0 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>