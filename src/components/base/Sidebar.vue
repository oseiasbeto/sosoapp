<template>
    <ul class="flex gap-2 w-full h-14 bg-black text-inherit fixed bottom-0 items-center">
        <li>
            <router-link to="/home">
                Feed
            </router-link>
        </li>
        <li>
            <router-link to="/search">
                Pesquisar
            </router-link>
        </li>
        <li>
            <router-link to="/notifications">
                Notificacoes(0)
            </router-link>
        </li>
        <li>
            <router-link to="/messages">
                Mensagens(0)
            </router-link>
        </li>
    </ul>
</template>