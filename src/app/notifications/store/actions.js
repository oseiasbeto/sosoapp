export default {
  addNotification({ commit }, notification) {
    commit("ADD_NOTIFICATION", notification);
  },
  loadNotifications({ commit }, { notifications, page, totalPages, total }) {
    commit("LOAD_NOTIFICATIONS", { notifications, page, totalPages, total });
  },
  markAsRead({ commit }, { notificationId, byId }) {
    commit("MARK_AS_READ", { notificationId, byId });
  },
  addNotificationModules({ commit }, newModule) {
    commit("ADD_NOTIFICATION_MODULES", newModule);
  },
  setHasNewNotification({ commit }) {
    commit("SET_HAS_NEW_NOTIFICATION");
  },
  setLoadNotifications(
    { commit },
    { notifications, byId, page, hasMore, totalPages, total }
  ) {
    commit("SET_LOAD_NOTIFICATIONS", {
      notifications,
      byId,
      page,
      hasMore,
      totalPages,
      total,
    });
  },
  addNewNotification({ commit }, { newNotification, byId }) {
    commit("ADD_NEW_NOTIFICATION", { newNotification, byId });
  },
};
