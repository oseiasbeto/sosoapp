export default {
    pagination: {
        currentPage: 0,
        totalPages: 0,
        hasMore: true // Indica se há mais notificações para carregar
    },
    notifications: [],
    unreadNotificationsCount: 0,
    modalContent: {
        name: '',
        show: false,
        data: {}
    },
    drawerContent: {
        name: '',
        show: false,
        data: {}
    }
};