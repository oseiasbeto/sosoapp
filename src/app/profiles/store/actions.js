export default {
  setProfile({ commit }, profile) {
    commit("SET_PROFILE", profile);
  },

  setUser({ commit }, { user }) {
    commit("SET_USER", user);
  },

  clearUser({ commit }) {
    commit("CLEAR_USER");
  },

  setScrollTopFromProfile({ commit }, { byId, scrollTop }) {
    commit("SET_SCROLLTOP_FROM_PROFILE", { byId, scrollTop });
  },

  setScrollTabFromProfile({ commit }, { byId, tab }) {
    commit("SET_TAB_FROM_PROFILE", { byId, tab });
  },
  addNewProfileFromProfiles({ commit }, newProfile) {
    commit("ADD_NEW_PROFILE_FROM_PROFILES", newProfile);
  },
};
