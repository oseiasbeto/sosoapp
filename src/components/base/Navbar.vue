<template>
    <div class="flex w-full border-b px-4 border-light-border dark:border-dark-border items-center justify-between h-14 bg-light-bg dark:bg-dark-bg z-10"
        :class="{ 'fixed top-0': isFixed }">
        <!--start left part-->
        <div class="flex items-center gap-3">
            <button class="text-light-text-secondary flex justify-center items-center w-[34px] h-[34px] dark:text-dark-text-light rounded-full active:bg-light-card dark:active:bg-dark-card" @click="router.back()"
                v-show="showBackBtn">
                <svg fill="none" width="24" viewBox="0 0 24 24" height="24">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z">
                    </path>
                </svg>
            </button>

            <div class="flex flex-col">
                <p class="text-base font-extrabold">{{ title }}</p>
                <p>{{ subtitle }}</p>
            </div>
        </div>

        <!--end left part-->

        <!--start right part-->
        <div class="flex items-center space-x-4">
            <slot name="right"></slot>
        </div>

        <!--end right part-->
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineProps({
    showBackBtn: {
        type: Boolean,
        default: true
    },
    isFixed: {
        type: Boolean,
        default: true
    },
    showSubTitle: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ""
    },
    subtitle: {
        type: String,
        default: ""
    }
})

const router = useRouter()
</script>