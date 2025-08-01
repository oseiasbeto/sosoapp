export default {
    isAuthenticated: (state) => !!state.accessToken,
    accessToken: (state) => state.accessToken
};