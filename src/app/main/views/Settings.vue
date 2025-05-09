<template>
    <h1>Configuracoes</h1>
    <button @click="openModal('logout-user')">Terminar sessao</button>

    <!--start modals-->
    <modal-logout-user :modal="modal" @close="closeModal" />
    <!--end modals-->
</template>

<script setup>
import { useStore } from 'vuex';
import { computed } from "vue";
import ModalLogoutUser from "@/components/modals/ModalLogoutUser.vue";

const store = useStore()

const modal = computed(() => {
    return store.getters.modalContent
})

const closeModal = () => {
    store.dispatch("openModal", {
        show: false,
        name: "",
        data: {}
    })
}

const openModal = (name, data) => {
    store.dispatch("openModal", {
        show: true,
        name,
        data
    })
}
</script>