export default {
    isAuthenticated: (state) => !!state.accessToken,
    currentUser: (state) => state.user,
    accessToken: (state) => state.accessToken
};