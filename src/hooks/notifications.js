import api from "../api";

import { ref } from 'vue';

import { useStore } from "vuex";

export function useNotification() {
    const loading = ref(false);

    const store = useStore();

    const getNotifications = async ({ page = 1, limit = 10 }) => {
        try {
            loading.value = true;
            const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
            const { notifications, page: currentPage, totalPages, total } = response.data;
            store.dispatch('loadNotifications', {
                notifications,
                page: currentPage,
                totalPages,
                total
            });
        } catch (err) {
            console.error('Erro ao carregar notificações:', err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
    return { loading, getNotifications };
}
