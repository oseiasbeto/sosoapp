<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useInfiniteScroll } from '@vueuse/core';
import { useNotification } from '@/app/main/notifications.hook';

const store = useStore();
const { loading, getNotifications } = useNotification();

const notifications = computed(() => store.getters['notifications']);
const hasMoreNotifications = computed(() => store.getters['hasMoreNotifications']);
const unreadNotificationsCount = computed(() => store.getters['unreadNotificationsCount']);
const scrollElement = ref(null);

// Mapeamento de ícones por tipo de notificação
const notificationIcons = {
    follow: {
        svg: `<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M7.5 6.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM12 12c-4.758 0-8.083 3.521-8.496 7.906A1 1 0 0 0 4.5 21H15a3 3 0 1 1 0-6c0-.824.332-1.571.87-2.113C14.739 12.32 13.435 12 12 12Zm6 2a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z"></path>`,
        class: 'w-4 h-4 text-blue-600'
    },
    follow_request: {
        svg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />`,
        class: 'w-4 h-4 text-blue-600'
    },
    like: {
        svg: `<path fill="#ec4899" fill-rule="evenodd" clip-rule="evenodd" d="M12.489 21.372c8.528-4.78 10.626-10.47 9.022-14.47-.779-1.941-2.414-3.333-4.342-3.763-1.697-.378-3.552.003-5.169 1.287-1.617-1.284-3.472-1.665-5.17-1.287-1.927.43-3.562 1.822-4.34 3.764-1.605 4 .493 9.69 9.021 14.47a1 1 0 0 0 .978 0Z"></path>`,
        class: 'w-4 h-4 text-pink-600'
    },
    comment: {
        svg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />`,
        class: 'w-4 h-4 text-gray-600'
    },
    mention: {
        svg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />`,
        class: 'w-4 h-4 text-blue-600'
    }
};

async function loadMore() {
    if (!hasMoreNotifications.value || loading.value) return;
    const nextPage = store.state.notifications.pagination.currentPage + 1;
    await getNotifications({ page: nextPage, limit: 10 });
}

useInfiniteScroll(
    scrollElement,
    () => {
        loadMore();
    },
    { distance: 100 }
);

if (notifications.value.length === 0) {
    getNotifications({ page: 1, limit: 10 });
}

function markAsRead(notificationId) {
    store.dispatch('markAsRead', notificationId);
}

function acceptFollowRequest(notificationId) {
    store.dispatch('acceptFollowRequest', notificationId);
}

function rejectFollowRequest(notificationId) {
    store.dispatch('rejectFollowRequest', notificationId);
}

function formatDate(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return notificationDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}
</script>

<template>
    <div class="max-w-md mx-auto py-4 px-4">
        <h1 class="text-xl font-semibold text-gray-900 mb-4">Notificações</h1>
        <div v-if="unreadNotificationsCount > 0" class="mb-4 text-sm text-gray-600">
            {{ unreadNotificationsCount }} nova(s) notificação(ões)
        </div>
        <div v-if="notifications.length === 0 && !loading" class="text-center text-gray-500 py-8">
            Nenhuma notificação.
        </div>
        <div v-else ref="scrollElement" class="space-y-2">
            <div v-for="notification in notifications" :key="notification.id"
                class="bg-white rounded-lg p-3 hover:bg-gray-50 transition flex items-start space-x-3 relative">
                <!-- Avatar do primeiro remetente -->
                <div class="flex-shrink-0 relative">
                    <img v-if="notification.senders[0]?.profile_image?.low"
                        :src="notification.senders[0].profile_image.low" alt="Avatar"
                        class="w-10 h-10 rounded-full object-cover" />
                    <svg v-else class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <!-- Ícone da notificação em formato absoluto -->
                    <svg v-if="notificationIcons[notification.type]"
                        class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-white border border-gray-200"
                        :class="notificationIcons[notification.type].class" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24" v-html="notificationIcons[notification.type].svg"></svg>
                </div>
                
                <!-- Conteúdo da notificação -->
                <div class="flex-1 min-w-0">
                    <p v-html="notification.message" class="text-sm text-gray-900 line-clamp-2"></p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(notification.created_at) }}</p>
                    <!-- Botões para follow_request -->
                    <div v-if="notification.type === 'follow_request' && !notification.read" class="mt-2 flex space-x-2">
                        <button @click="acceptFollowRequest(notification.id)"
                            class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                            Confirmar
                        </button>
                        <button @click="rejectFollowRequest(notification.id)"
                            class="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">
                            Excluir
                        </button>
                    </div>
                </div>

                <!-- Indicador de não lida -->
                <div v-if="!notification.read" class="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            </div>

            <div v-if="loading" class="text-center text-gray-500 py-4">Carregando...</div>

            <div v-if="!hasMoreNotifications && notifications.length > 0" class="text-center text-gray-500 py-4">
                Não há mais notificações.
            </div>
        </div>
    </div>
</template>

<style scoped>
b {
    font-weight: 600;
}
.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>