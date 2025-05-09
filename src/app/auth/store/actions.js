export default {
    login({ commit }, { user, token }) {
        commit('SET_USER', user);
        commit('SET_ACCESS_TOKEN', token);
    },
    logout({ commit }) {
        commit('CLEAR_SESSION');
    }
};