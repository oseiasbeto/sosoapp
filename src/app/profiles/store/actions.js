export default {
    setProfile({ commit }, profile) {
        commit('SET_PROFILE', profile)
    },
    addNewProfileFromProfiles({ commit }, newProfile) {
        commit('ADD_NEW_PROFILE_FROM_PROFILES', newProfile)
    }
};