export default {
    setAccessToken({ commit }, { token }) {
        commit('SET_ACCESS_TOKEN', token);
    },
    clearAcessToken({ commit }) {
        commit('CLEAR_ACCESS_TOKEN');
    }
};