export default {
  setProfile({ commit }, profile) {
    commit("SET_PROFILE", profile);
  },
  updateDataFromProfiles({ commit }, { byId, scrollTop, tab }) {
    commit("UPDATE_DATA_FROM_PROFILES", { byId, scrollTop, tab });
  },
  addNewProfileFromProfiles({ commit }, newProfile) {
    commit("ADD_NEW_PROFILE_FROM_PROFILES", newProfile);
  },
};
