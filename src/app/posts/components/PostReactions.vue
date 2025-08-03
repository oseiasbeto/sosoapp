<template>
    <div  class="flex h-7 overflow-x-auto justify-between text-sm items-center gap-5">
        <button class="flex ml-[-6px] text-[#6f869f] flex-1 py-[3px] px-[5px] h-full rounded-full items-center gap-1.5" @click.stop @click="replyPost">
            <span class="flex items-center h-full" name="icon">
                <svg fill="currentColor" width="18" viewBox="0 0 24 24" height="18"
                    style="pointer-events: none;">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M2.002 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H12.28l-4.762 2.858A1 1 0 0 1 6.002 21v-2h-1a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v1.234l3.486-2.092a1 1 0 0 1 .514-.142h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-14Z">
                    </path>
                </svg>
            </span>
            <span v-show="repliesCount > 0" class="flex mt-0.5" name="count">{{ repliesCount }}</span>
        </button>

        <button class="flex flex-1 py-[3px] text-[#6f869f] px-[5px] h-full rounded-full items-center gap-1.5" @click.stop
            :class="{ '!text-[#13c371] dark:!text-reposted': hasReposted }" @click="repost">
            <span class="flex items-center h-full" name="icon">
                <svg fill="none" width="18" viewBox="0 0 24 24" height="18" style="pointer-events: none;">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M17.957 2.293a1 1 0 1 0-1.414 1.414L17.836 5H6a3 3 0 0 0-3 3v3a1 1 0 1 0 2 0V8a1 1 0 0 1 1-1h11.836l-1.293 1.293a1 1 0 0 0 1.414 1.414l2.47-2.47a1.75 1.75 0 0 0 0-2.474l-2.47-2.47ZM20 12a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3H6.164l1.293 1.293a1 1 0 1 1-1.414 1.414l-2.47-2.47a1.75 1.75 0 0 1 0-2.474l2.47-2.47a1 1 0 0 1 1.414 1.414L6.164 17H18a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1Z">
                    </path>
                </svg>
            </span>
            <span v-show="repostsCount > 0" class="flex mt-0.5" name="count">{{ repostsCount }}</span>
        </button>

        <button class="flex flex-1 py-[3px] px-[5px] text-[#6f869f] h-full rounded-full items-center gap-1.5"
            :disabled="loadingToggleLike" :class="{ '!text-liked': hasLiked }" @click.stop @click="likePost">
            <span class="flex items-center h-full" name="icon">
                <svg v-if="!hasLiked" fill="none" width="18" viewBox="0 0 24 24" height="18"
                    style="pointer-events: none;">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M16.734 5.091c-1.238-.276-2.708.047-4.022 1.38a1 1 0 0 1-1.424 0C9.974 5.137 8.504 4.814 7.266 5.09c-1.263.282-2.379 1.206-2.92 2.556C3.33 10.18 4.252 14.84 12 19.348c7.747-4.508 8.67-9.168 7.654-11.7-.541-1.351-1.657-2.275-2.92-2.557Zm4.777 1.812c1.604 4-.494 9.69-9.022 14.47a1 1 0 0 1-.978 0C2.983 16.592.885 10.902 2.49 6.902c.779-1.942 2.414-3.334 4.342-3.764 1.697-.378 3.552.003 5.169 1.286 1.617-1.283 3.472-1.664 5.17-1.286 1.927.43 3.562 1.822 4.34 3.764Z">
                    </path>
                </svg>
                <svg v-else fill="none" width="18" viewBox="0 0 24 24" height="18" class="r-84gixx">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M12.489 21.372c8.528-4.78 10.626-10.47 9.022-14.47-.779-1.941-2.414-3.333-4.342-3.763-1.697-.378-3.552.003-5.169 1.287-1.617-1.284-3.472-1.665-5.17-1.287-1.927.43-3.562 1.822-4.34 3.764-1.605 4 .493 9.69 9.021 14.47a1 1 0 0 0 .978 0Z">
                    </path>
                </svg>
            </span>
            <span v-show="likesCount > 0" class="flex mt-0.5" name="count">{{ likesCount }}</span>
        </button>



        <button class="flex flex-1 py-[3px] text-[#6f869f] px-[5px] h-full rounded-full" @click.stop @click="openMore()">
            <svg fill="currentColor" width="18" viewBox="0 0 24 24" height="18"
                style="pointer-events: none;">
                <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                    d="M2 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm16 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z">
                </path>
            </svg>
        </button>
    </div>
</template>

<script setup>
defineProps({
    repliesCount: {
        type: Number,
        default: 0,
    },
    likesCount: {
        type: Number,
        default: 0,
    },
    repostsCount: {
        type: Number,
        default: 0,
    },
    hasLiked: {
        type: Boolean,
        default: false
    },
    loadingToggleLike: {
        type: Boolean,
        default: false
    },
    hasReposted: {
        type: Boolean,
        default: false
    },
    isBigger: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['like-post', 'reply-post', 'repost', 'open-more'])

const likePost = () => {
    emit('like-post')
}
const replyPost = () => {
    emit('reply-post')
}
const repost = () => {
    emit('repost')
}
const openMore = () => {
    emit('open-more')
}
</script>