export default [
    {
        path: '/notifications',
        name: 'Notifications',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Notificacoes - 1kole'
        },
        component: () => import('./views/Notifications.vue')
    }
]