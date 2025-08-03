export default [
    {
        path: '/search',
        name: 'Search',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Pesquisar - 1kole'
        },
        component: () => import('./views/Search.vue')
    }
]