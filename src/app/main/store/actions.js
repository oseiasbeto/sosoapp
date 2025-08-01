export default {
    openModal({ commit }, content) {
        commit('OPEN_MODAL', content); // Chama a mutação para abrir o modal
    },
    openDrawer({ commit }, content) {
        commit('OPEN_DRAWER', content); // Chama a mutação para abrir o modal
    },
    closeDrawer({ commit }) {
        commit('CLOSE_DRAWER'); // Chama a mutação para fechar o modal
    },
    closeModal({ commit }) {
        commit('CLOSE_MODAL'); // Chama a mutação para fechar o modal
    }
};