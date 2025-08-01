<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useInfiniteScroll } from '@vueuse/core';
import { useNotification } from '@/app/notifications/notifications.hook';

const store = useStore();
const { loading, getNotifications } = useNotification();

const unreadNotificationsCount = computed(() => store.getters['unreadNotificationsCount']);

const notifications = computed(() => store.getters['notifications']);

function markAsRead(notificationId) {
    store.dispatch('markAsRead', notificationId);
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
                </div>
            </div>

            <div v-if="loading" class="text-center text-gray-500 py-4">Carregando...</div>

            <div v-if="notifications.length > 0" class="text-center text-gray-500 py-4">
                Não há mais notificações.
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>