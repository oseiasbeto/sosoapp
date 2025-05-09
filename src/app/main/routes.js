export default [
    {
        path: '/home',
        name: 'Home',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: '1Kole - Conecte-se e compartilhe'
        },
        component: () => import('./views/Home.vue')
    },
    {
        path: '/search',
        name: 'Search',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Explorar - 1kole'
        },
        component: () => import('./views/Search.vue')
    },
    {
        path: '/notifications',
        name: 'Notifications',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Notificacoes - 1kole'
        },
        component: () => import('./views/Notifications.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Configuracoes - 1kole'
        },
        component: () => import('./views/Settings.vue')
    },
    {
        path: '/messages',
        name: 'Messages',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Mensagens - 1kole'
        },
        component: () => import('./views/Messages.vue')
    }
]