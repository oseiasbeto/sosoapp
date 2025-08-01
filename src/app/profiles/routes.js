export default [
    {
        path: '/profile/:user_id/setup',
        name: 'Edit profile',
        meta: {
            requiresAuth: true,
            rootPage: 'profiles',
            title: 'Editar perfil - 1kole'
        },
        component: () => import('./views/EditProfile.vue')
    },
        {
        path: '/profile/:user_id',
        name: 'Profile',
        meta: {
            requiresAuth: true,
            rootPage: 'main',
            title: 'Perfil - 1kole'
        },
        component: () => import('./views/Profile.vue')
    }
]