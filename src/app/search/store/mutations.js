export default {
  ADD_USERS_FROM_MODULES(state, { userModule }) {
    const users = state.users;

    if (!users) return;
    users.push(userModule);
  },
  TOGGLE_FOLLOW_USER(state, { byId, userIdToFollow, userId }) {
    const module = state.users.find((m) => m.byId === byId);
    if (!module) return;

    const users = module.users;

    const following = users.find((p) => p._id === userIdToFollow);
    if (!following) return;

    const index = following.followers.indexOf(userId);

    if (index === -1) {
      following.followers.push(userId);
    } else {
      following.followers.splice(index, 1);
    }
  },
};
