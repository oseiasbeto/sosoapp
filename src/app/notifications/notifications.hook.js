import api from "@/api";

import { ref } from "vue";

import { useStore } from "vuex";

export function useNotification() {
  const loading = ref(false);

  const store = useStore();

  const getNotifications = async ({ page = 1, tab = "all", limit = 10 }) => {
    try {
      loading.value = true;
      const response = await api.get(
        `/notifications/${tab}?page=${page}&limit=${limit}`
      );
      const {
        notifications,
        page: currentPage,
        totalPages,
        hasMore,
        total,
      } = response.data;

      const newModule = {
        byId: tab,
        notifications,
        pagination: {
          page: currentPage,
          total,
          hasMore,
          totalPages,
        },
      };

      store.dispatch("addNotificationModules", newModule);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
  return { loading, getNotifications };
}
