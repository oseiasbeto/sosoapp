<template>
    <div>
        <!--start notifications list-->
        <NotificationList 
            ref="notificationList" 
            :notifications="cachedData?.notifications || []"
            :pagination="cachedData?.pagination || {}" 
            :loading="loadingGetNotifications" 
            :loading-load-more="loadingLoadMoreNotifications"
            @loadMore="handleLoadMoreNotifications"
            :b-space="55"
            :show-list="true">

            <template #before-content>
                <div>
                    <Tabs ref="tabsComponent" v-model="activeTab" :tabs="tabs" />
                </div>
            </template>

        </NotificationList>
        <!--end notifications list-->
    </div>
</template>

<script setup>
import { computed, nextTick, watch, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useNotification } from '@/app/notifications/notifications.hook';
import Tabs from '@/components/base/Tabs.vue';
import NotificationList from '../components/NotificationList.vue';

const store = useStore();
const { getNotifications, loading: loadingGetNotifications } = useNotification();
const { loadMoreNotifications, loading: loadingLoadMoreNotifications } = useNotification();

const activeTab = ref('all')
const tabsComponent = ref(null)

const tabs = ref([
    { label: "Tudo", value: 'all' },
    { label: "Seguidores", value: 'follow' },
    { label: "Resposta", value: 'reply' },
    { label: "Repostagens", value: 'repost' }
])

const notifications = computed(() => store.getters.notifications);

const cachedData = computed(() => {
    return notifications.value.find(module => module.byId === activeTab.value) || null
})

function markAsRead(notificationId) {
    store.dispatch('markAsRead', notificationId);
}

const handleLoadMoreNotifications = async (newPage) => {
    try {
        console.log(cachedData.value?.pagination?.total)
        await loadMoreNotifications({
            page: newPage,
            tab: activeTab.value,
            totalItems: cachedData.value?.pagination?.total || 0,
            limit: 10
        });
    } catch (error) {
        console.error('Error loading more notifications:', error);
    }
};

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
