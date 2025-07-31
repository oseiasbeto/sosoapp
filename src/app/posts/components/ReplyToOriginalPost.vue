<template>
    <div
        class="pb-4 pt-2 mb-4 shrink-0 mx-4 min-w-0 border-b border-light-border dark:border-dark-border flex flex-row">
        <div>
            <Avatar :url="props.originalPost?.author?.profile_image?.low" />
        </div>

        <div class="w-full ml-3 mr-2 min-w-0 flex-1 flex-shrink-0">
            <!--start header-->
            <div class="flex flex-1 gap-0.5 items-baseline min-w-0 max-w-full overflow-hidden">
                <div class="min-w-0 overflow-hidden">
                    <p
                        class="text-light-text-primary flex-1 mb-0.5 truncate text-ellipsis font-semibold dark:text-dark-text-primary">
                        {{
                            props.originalPost?.author?.name }}</p>
                </div>


                <div v-if="props.originalPost?.author?.verified" class="flex flex-initial"
                    style="padding-left: 2px; align-self: center; margin-top: -4px;">
                    <svg fill="none" width="14" viewBox="0 0 24 24" height="14">
                        <circle cx="12" cy="12" r="11.5" fill="hsl(211, 99%, 56%)"></circle>
                        <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
                            d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
                        </path>
                    </svg>
                </div>
            </div>
            <!--end header-->

            <!--start body-->
            <p
                class="line-clamp-6 whitespace-pre-wrap text-light-text-secondary dark:text-[#d7dde4] leading-5 text-sm shrink-1">
                {{ props.originalPost.content }}
            </p>
            <!--end body-->

        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/utilities/Avatar.vue';
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