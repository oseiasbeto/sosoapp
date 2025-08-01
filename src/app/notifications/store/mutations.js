export default {
  ADD_NOTIFICATION(state, notification) {
    const existingNotificationIndex = state.notifications.findIndex(
      (n) => n.id === notification.id
    );
    if (existingNotificationIndex !== -1) {
      state.notifications[existingNotificationIndex] = {
        ...state.notifications[existingNotificationIndex],
        message: notification.message,
        senders: notification.senders,
        updated_at: notification.updated_at || new Date(),
      };
    } else {
      state.notifications.unshift({
        ...notification,
        read: false,
      });
      state.unreadNotificationsCount += 1;
    }
  },
  LOAD_NOTIFICATIONS(state, { notifications, page, totalPages, total }) {
    notifications.forEach((notification) => {
      const existingIndex = state.notifications.findIndex(
        (n) => n.id === notification.id
      );
      if (existingIndex !== -1) {
        state.notifications[existingIndex] = {
          ...state.notifications[existingIndex],
          ...notification,
          read: state.notifications[existingIndex].read,
        };
      } else {
        state.notifications.push({
          ...notification,
          read: notification.read || false,
        });
      }
    });
    state.pagination.currentPage = page;
    state.pagination.totalPages = totalPages;
    state.pagination.hasMore = page < totalPages;
    state.unreadNotificationsCount = state.notifications.filter(
      (n) => !n.read
    ).length;
  },
  MARK_AS_READ(state, notificationId) {
    const notification = state.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification && !notification.read) {
      notification.read = true;
      state.unreadNotificationsCount -= 1;
    }
  },
  MARK_ALL_AS_READ(state) {
    state.notifications.forEach((n) => {
      if (!n.read) {
        n.read = true;
      }
    });
    state.unreadNotificationsCount = 0;
  },
  ADD_NOTIFICATION_MODULES(state, newModule) {
    const notifications = state.notifications;

    if (!notifications) return;
    notifications.push(newModule);
  },
};
