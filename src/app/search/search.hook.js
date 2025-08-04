import api from "@/api";

import { ref } from "vue";

import { useStore } from "vuex";

export function useSearch() {
  const loading = ref(false);

  const store = useStore();

  const getSuggestedUsers = async ({ page = 1, tab = "feed", limit = 10 }) => {
    try {
      loading.value = true;
      const response = await api.get(
        `/users?page=${page}&limit=${limit}`
      );

      const {
        users,
        page: currentPage,
        total,
        hasMore,
        totalPages,
      } = response.data;

      const userModule = {
        byId: tab,
        users,
        pagination: {
          page: currentPage,
          total,
          hasMore,
          totalPages,
        },
      };

      store.dispatch("addUsersFromModules", {userModule});
    } catch (err) {
      console.error("Erro ao carregar usuarios sugestivos:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
  return { loading, getSuggestedUsers };
}
