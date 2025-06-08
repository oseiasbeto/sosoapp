export default [
    {
        path: '/composer',
        name: 'Composer',
        meta: {
            requiresAuth: true,
            rootPage: 'posts',
            title: '1Kole - Compor'
        },
        component: () => import('./views/Composer.vue')
    },
    {
        path: '/post/:id',
        name: 'Post details',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: '1Kole - Postagem'
        },
        component: () => import('./views/PostDetails.vue')
    }
]