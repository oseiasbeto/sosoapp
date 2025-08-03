import api from "@/api";

import { ref } from "vue";

import { useStore } from "vuex";

export function useSearch() {
  const loading = ref(false);

  const store = useStore();

  const getSuggestedUsers = async () => {
    try {
      loading.value = true;
      const response = await api.get("/users");
      console.log(response);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
  return { loading, getSuggestedUsers };
}
