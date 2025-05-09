import api from "../api";

import { ref } from 'vue';

import { useStore } from "vuex";

export function useProfile() {
    const loading = ref(false);

    const store = useStore();

    const getUserByUsername = async (username) => {
        try {
            loading.value = true;
            const response = await api.get('/users/profile/'+username);
            const currentProfile = response.data.user
            store.dispatch("setProfile", currentProfile)
        } catch (err) {
            console.log(err.message); // Exibe o erro no console.
            throw new Error(err.response?.data?.message || 'Erro ao processar a ação de buscar usuario pelo username.');
        } finally {
            loading.value = false; // Desativa o estado de carregamento.
        }
    };

    const getUserById = async (id) => {
        try {
            loading.value = true;
            const response = await api.get('/users/'+id);
            const currentProfile = response.data.user
            store.dispatch("setProfile", currentProfile)
        } catch (err) {
            console.log(err.message); // Exibe o erro no console.
            throw new Error(err.response?.data?.message || 'Erro ao processar a ação de buscar usuario pelo id.');
        } finally {
            loading.value = false; // Desativa o estado de carregamento.
        }
    };

    const checkUsername = async (username) => {
        try {
            loading.value = true
            const response = await api.get("/users/check-username/" + username)

            return response
        } catch (err) {
            console.log(err.message)
            throw new Error(err.response?.data?.message || 'Erro ao processar a ação de verificar o nome de utilizador.');
        } finally {
            loading.value = false;
        }
    }

    const followUser = async ({ userIdToFollow, isFollowBack = false }) => {
        try {
            loading.value = true;
            const response = await api.post('/users/follow-user', {
                userIdToFollow,
                isFollowBack,
            });

            const { data } = response;
            if (!data) {
                throw new Error('Resposta do backend inválida.');
            }

            const currentUser = store.getters.currentUser;
            const currentProfile = store.getters.currentProfile;

            if (!currentUser || !currentProfile) {
                throw new Error('Usuário ou perfil não encontrado no estado.');
            }

            const userId = currentUser._id;
            const profileId = currentProfile._id;

            // Atualiza o estado com base na resposta do backend
            store.commit('UPDATE_FOLLOW_STATE', {
                userId,
                profileId,
                isFollowing: data.isFollowing,
                isFollowedBy: data.isFollowedBy,
            });

            return response; // Retorna a resposta para o chamador (ex.: para exibir mensagem)
        } catch (err) {
            const data = err.response.data
            if (data.message === 'Você não pode seguir de volta porque este usuário não te segue.') {
                const currentUser = store.getters.currentUser;
                const currentProfile = store.getters.currentProfile;

                const userId = currentUser._id;
                const profileId = currentProfile._id;

                store.commit('UPDATE_FOLLOW_STATE', {
                    userId,
                    profileId,
                    isFollowing: data.isFollowing,
                    isFollowedBy: data.isFollowedBy,
                });
            }
            console.error('Erro ao seguir/deixar de seguir:', err.message);
            throw new Error(err.response?.data?.message || 'Erro ao processar a ação de seguir.');
        } finally {
            loading.value = false;
        }
    };

    const editProfile = async ({name, username, profile_image, gender, website, birth_date, location, bio }) => {
        try {
            loading.value = true;

            const response = await api.put('/users/update-user-profile', {
                name,
                profile_image,
                username,
                gender,
                website,
                birth_date,
                location,
                bio
            });

            const { data } = response;
            if (!data) {
                throw new Error('Resposta do backend inválida.');
            }
            store.commit("SET_USER", data.new_profile)
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Erro ao actualizar o perfil.');
        } finally {
            loading.value = false;
        }
    };

    // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
    return { 
        loading, 
        getUserByUsername, 
        getUserById,
        editProfile, 
        checkUsername, 
        followUser 
    };
}
