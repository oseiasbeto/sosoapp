<template>
    <div @click="goToTarget(props.notification?.target, props.notification?.type)"
        class="bg-white rounded-lg p-3 hover:bg-gray-50 transition flex items-start space-x-3 relative">
        <!-- Avatar do primeiro remetente -->
        <div class="flex-shrink-0 relative">
            <img v-if="props.notification.senders[0]?.profile_image?.low"
                :src="props.notification.senders[0].profile_image.low" alt="Avatar"
                class="w-10 h-10 rounded-full object-cover" />
        </div>

        <!-- Conteúdo da notificação -->
        <div class="flex-1 min-w-0">
            <p v-html="props.notification.message" class="text-sm text-gray-900 line-clamp-2"></p>
            <p class="text-xs text-gray-500 mt-1">{{ formattedTime(props.notification.updated_at) }}</p>
        </div>
    </div>
</template>

<script setup>
import formattedTime from '@/utils/formatted-time';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const props = defineProps({
    notification: {
        type: Object,
        required: true
    }
})



const router = useRouter()
const store = useStore()

const user = computed(() => store.getters.currentUser);

const goToTarget = (target, type) => {
    switch (type) {
        case 'follow':
            if (!target) {
                store.dispatch('setProfile', user?.value)
                router.push({ name: 'Profile', params: { user_id: user?.value?._id } });
            } else {
                store.dispatch('setProfile', target?.follower)
                router.push({ name: 'Profile', params: { user_id: target?.follower?._id } });
            }
            break;
        case 'like':
            if (target) {
                store.dispatch('setPost', target);
                router.push({ name: 'Post details', params: { id: target?._id }, query: { post_module: props?.notification?.module } });
            }
            break
        case 'repost':
            if (target) {
                store.dispatch('setPost', target );
                router.push({ name: 'Post details', params: { id: target?._id }, query: { post_module: props?.notification?.module } });
            }
            break;
            case 'reply':
            if (target) {
                store.dispatch('setPost', target);
                router.push({ name: 'Post details', params: { id: target?._id }, query: { post_module: props?.notification?.module } });
            }
        default:
            break;
    }
}
</script>