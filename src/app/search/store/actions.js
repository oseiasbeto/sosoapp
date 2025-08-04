export default {
  addUsersFromModules({ commit }, { userModule }) {
    commit("ADD_USERS_FROM_MODULES", { userModule });
  },
  toggleFollowUser({ commit }, { byId, userIdToFollow, userId }) {
    commit("TOGGLE_FOLLOW_USER", { byId, userIdToFollow, userId });
  },
};
