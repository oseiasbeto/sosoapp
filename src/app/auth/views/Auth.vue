<script setup>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import ModalRegisterUser from "@/components/modals/ModalRegisterUser.vue";
import ModalAuthUser from "@/components/modals/ModalAuthUser.vue";
import ModalRecoverPassword from "@/components/modals/ModalRecoverPassword.vue";

const router = useRouter();
const store = useStore()

const modal = computed(() => {
    return store.getters.modalContent
})

const openModal = (name, data) => {
    store.dispatch("openModal", {
        show: true,
        name,
        data
    })
}
const closeModal = () => {
    store.dispatch("openModal", {
        show: false,
        name: "",
        data: {}
    })
}

</script>

<template>
    <div class="flex min-h-screen items-center justify-center">
        <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
            <h2 class="text-2xl font-semibold text-center text-gray-700">Login</h2>
            <p class="text-gray-500 text-center mt-2">Entre com sua conta</p>

            <div class="mt-6"> 
                <button @click="openModal('login-user')"
                    class="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
                    Entrar
                </button>
            </div>

            <p class="text-center text-gray-600 mt-4">
                Não tem conta? <button @click="openModal('register-user')" class="text-blue-500">Cadastre-se</button>
            </p>
        </div>

        <!--start modals-->
        <modal-register-user :modal="modal" @close="closeModal" @openLogin="openModal('login-user')" />
        <modal-auth-user :modal="modal" @close="closeModal" @recoverPassword="openModal('recover-password')" />
        <modal-recover-password :modal="modal" @close="closeModal" @openLogin="openModal('login-user')" />
        <!--end modals-->
    </div>
</template>

<style></style>