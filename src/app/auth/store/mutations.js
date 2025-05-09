export default {
    SET_USER(state, user) {
        state.user = user;
    },
    SET_ACCESS_TOKEN(state, token) {
        state.accessToken = token;
    },
    CLEAR_SESSION(state) {
        state.user = null;
        state.accessToken = null;
    }
};