<template>
  <div @click.stop v-if="media.length > 0"
    class="max-w-full mb-2.5 border border-light-border dark:border-dark-border mt-3 rounded-xl overflow-hidden"
    :class="mediaLayoutClass">
    <div class="flex flex-wrap gap-1">
      <img v-for="(item, index) in media" :key="item?.public_id"
        v-lazy="item.type === 'video' ? item?.thumbnail : item?.url" :alt="`Mídia ${index + 1} do post`"
        class="object-cover bg-light-card dark:bg-dark-card" :class="imageClass(index)"
        @click="openMediaPreview(item?.post, item.type, index, media)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

// Props
const props = defineProps({
  media: {
    type: Array,
    default: () => []
  },
});

// Computeds
const mediaCount = computed(() => props.media.length);

const mediaLayoutClass = computed(() => {
  const count = mediaCount.value;
  return {
    'single-media': count === 1,
    'two-media': count === 2,
    'three-media': count === 3,
    'four-media': count === 4,
  };
});

const imageClass = (index) => {
  const count = mediaCount.value;
  if (count === 1) return 'w-full aspect-square';
  if (count === 2) return index === 0 ? 'w-[calc(50%-2px)] aspect-square' : 'w-[calc(50%-2px)] aspect-square';
  if (count === 3) return index === 0 ? 'w-[66%] aspect-[4/3]' : index === 1 ? 'w-[calc(34%-4px)] aspect-square' : 'w-full aspect-[2/1]';
  if (count === 4) return 'w-[calc(50%-2px)] aspect-square';
  return '';
};

// Métodos
const openMediaPreview = (id, type, index, items) => {
  store.dispatch("setMedia", {
    type,
    index,
    items
  })
  router.push({
    path: '/post/media/' + id,
    query: {
      type,
      initial_index: index
    }
  })
};
</script>