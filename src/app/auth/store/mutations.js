export default {
    SET_ACCESS_TOKEN(state, token) {
        state.accessToken = token;
    },
    CLEAR_ACCESS_TOKEN(state) {
        state.accessToken = null;
    }
};