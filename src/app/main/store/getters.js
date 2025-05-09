export default {
    modalContent: (state) => state.modalContent, // Retorna o conteúdo do modal,
    drawerContent: (state) => state.drawerContent, // Retorna o conteúdo do modal,
    notifications: state => state.notifications,
    unreadNotificationsCount: state => state.unreadNotificationsCount,
    hasMoreNotifications: state => state.pagination.hasMore
};