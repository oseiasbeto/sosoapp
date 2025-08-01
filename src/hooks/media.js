import api from "../api";

import { ref } from 'vue';

import { useStore } from "vuex";

export function useMedia() {
    const loading = ref(false);

    const store = useStore();

    const getMediaByPostId = async ({id, type, index}) => {
        try {
            loading.value = true;
            const response = await api.get(`/media/post/${id}`);
            const { media } = response.data;

            store.dispatch('setMedia', {
                index,
                type,
                items: media
            });
        } catch (err) {
            console.error('Erro ao carregar notificações:', err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };
    
    // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
    return { loading, getMediaByPostId };
}
