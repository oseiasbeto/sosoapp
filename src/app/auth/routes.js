export default [
    {
        path: '/',
        name: 'Login',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: '1Kole - Login'
        },
        component: () => import('./views/Auth.vue')
    },
    {
        path: '/account/verify-email',
        name: 'Verify email',
        meta: {
            routeAuth: true,
            rootPage: 'auth',
            title: '1Kole'
        },
        component: () => import('./views/VerifyEmail.vue')
    },
]