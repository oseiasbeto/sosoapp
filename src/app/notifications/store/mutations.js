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
    notifications.push(newModule);
  },

  SET_LOAD_NOTIFICATIONS(state, { notifications, page, totalPages, byId, hasMore }) {
    const index = state.notifications.findIndex((m) => m.byId === byId);

    if (index !== -1) {
      const _cachedData = state.notifications[index];

      // Filtra os novos posts para remover quaisquer que já existam no cache
      const uniqueNewNotifications = notifications.filter(
        (newNotification) =>
          !_cachedData.notifications.some(
            (existingNotification) => existingNotification._id === newNotification._id
          )
      );

      _cachedData.notifications = [..._cachedData.notifications, ...uniqueNewNotifications];
      _cachedData.pagination.page = page;
      _cachedData.pagination.totalPages = totalPages;
      _cachedData.pagination.hasMore = hasMore;
    }
  },

  ADD_NEW_NOTIFICATION(state, { newNotification, byId }) {
    const moduleIndex = state.notifications.findIndex((m) => m.byId === byId);
    if (moduleIndex === -1) return;

    // Se o módulo não existir, não faz nada
    const module = state.notifications[moduleIndex];
    if (!module) return;
    else {
      // Verifica se a notificação já existe
      const existingNotificationIndex = module.notifications.findIndex(
        (n) => n._id === newNotification._id
      );
      // Se a notificação já existe, atualiza ela
      if (existingNotificationIndex !== -1) {
        module.notifications.splice(existingNotificationIndex, 1);
        module.notifications.unshift(newNotification);
        console.log(existingNotificationIndex);
        console.log(module.notifications);
      } else {
        module.notifications = [
          newNotification,
          ...(Array.isArray(module.notifications) ? module.notifications : []),
        ];

        // Atualiza paginação sem conflitos
        module.pagination.total += 1;
        module.pagination.totalPages = Math.ceil(
          module.pagination.total / module.pagination.limit || 10
        );
      }
    }
  },
};
