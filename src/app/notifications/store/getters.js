export default {
  notifications: (state) => state.notifications,
  unreadNotificationsCount: (state) => state.unreadNotificationsCount,
  hasMoreNotifications: (state) => state.pagination.hasMore,
};
