<template>
    <div class="py-4">
        <h1 class="text-xl font-semibold text-gray-900 mb-4">Notificações</h1>
        <div v-if="unreadNotificationsCount > 0" class="mb-4 text-sm text-gray-600">
            {{ unreadNotificationsCount }} nova(s) notificação(ões)
        </div>

        <Tabs ref="tabsComponent" v-model="activeTab" :tabs="tabs" />

        <!--start notifications list-->
        <div v-if="data?.notifications?.length === 0 && !loadingGetNotifications"
            class="text-center px-4 text-gray-500 py-8">
            Nenhuma notificação.
        </div>
        <div v-else ref="scrollElement" class="space-y-2 px-4">
            <div v-for="notification in data?.notifications" :key="notification.id"
                class="bg-white rounded-lg p-3 hover:bg-gray-50 transition flex items-start space-x-3 relative">
                <!-- Avatar do primeiro remetente -->
                <div class="flex-shrink-0 relative">
                    <img v-if="notification.senders[0]?.profile_image?.low"
                        :src="notification.senders[0].profile_image.low" alt="Avatar"
                        class="w-10 h-10 rounded-full object-cover" />
                </div>

                <!-- Conteúdo da notificação -->
                <div class="flex-1 min-w-0">
                    <p v-html="notification.message" class="text-sm text-gray-900 line-clamp-2"></p>
                    <p class="text-xs text-gray-500 mt-1">{{ formattedTime(notification.updated_at) }}</p>
                </div>
            </div>

            <div v-if="loadingGetNotifications" class="text-center text-gray-500 py-4">Carregando...</div>

            <div v-if="data?.notifications?.length > 0" class="text-center text-gray-500 py-4">
                Não há mais notificações.
            </div>
        </div>
        <!--end notifications list-->
    </div>
</template>

<script setup>
import { computed, nextTick, watch, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useNotification } from '@/app/notifications/notifications.hook';
import formattedTime from '@/utils/formatted-time';
import Tabs from '@/components/base/Tabs.vue';
import SpinnerSmall from '@/components/base/SpinnerSmall.vue';

const store = useStore();
const { getNotifications, loading: loadingGetNotifications } = useNotification();

const activeTab = ref('all')
const tabsComponent = ref(null)
const isTabSwitching = ref(false);

const tabs = ref([
    { label: "Tudo", value: 'all' },
    { label: "Seguidores", value: 'follow' },
    { label: "Resposta", value: 'reply' },
    { label: "Repostagens", value: 'repost' }
])

const tabIndices = ref({
    all: 0,
    follow: 1,
    reply: 2,
    repost: 3
})

const unreadNotificationsCount = computed(() => store.getters['unreadNotificationsCount']);
const notifications = computed(() => store.getters['notifications']);

const data = computed(() => {
    const index = tabIndices.value[activeTab.value]
    return index !== null ? notifications.value[index] : null
})

function markAsRead(notificationId) {
    store.dispatch('markAsRead', notificationId);
}

async function setScrollPosition(position) {
    /* 
    await nextTick(); // Espera a atualização do DOM
    if (postListComponent.value?.setScrollTop) {
        postListComponent.value.setScrollTop(position);
    } else {
        console.error('setScrollTop method not available on postListComponent');
    }*/
};

watch(() => activeTab.value, async (newTab, oldTab) => {
    if (newTab === oldTab) return;

    isTabSwitching.value = true; // Bloqueia a lógica de scroll durante a troca

    const cachedNotifications = notifications.value.find(p => p.byId === newTab);
    if (cachedNotifications) {
        // Dados já em cache, apenas ajusta o scroll
        await nextTick();
        setScrollPosition(cachedNotifications.scroll_top || 0);
    } else {
        // Se não há cache, busca os posts
        await getNotifications({ page: 1, limit: 10, tab: newTab });
        setScrollPosition(0); // Reseta o scroll
    }
    // Restaura a lógica de scroll após um pequeno delay
    setTimeout(() => {
        isTabSwitching.value = false;
    }, 100);
});

onMounted(async () => {
    await getNotifications({
        page: 1,
        limit: 10,
        tab: 'all'
    }).catch(err => {
        console.log(err)
    })
})
</script>

