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
    },
    addNotification({ commit }, notification) {
        commit('ADD_NOTIFICATION', notification);
    },
    loadNotifications({ commit }, { notifications, page, totalPages, total }) {
        commit('LOAD_NOTIFICATIONS', { notifications, page, totalPages, total });
    },
    clearNotifications({ commit }) {
        commit('CLEAR_NOTIFICATIONS');
    },
    markAsRead({ commit }, notificationId) {
        commit('MARK_AS_READ', notificationId);
    },
    markAllAsRead({ commit }) {
        commit('MARK_ALL_AS_READ');
    }
};