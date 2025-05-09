<template>
    <!-- Container do dialog do Headless UI -->
    <Dialog :open="isOpen" class="relative z-50">
        <!-- Overlay de fundo escurecido -->
        <div class="fixed inset-0 bg-gray-500/30 backdrop-blur dark:bg-gray-600/90" aria-hidden="true" />

        <!-- Container centralizado do modal -->
        <div class="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
            <!-- Painel do modal -->
            <DialogPanel class="w-full max-w-[95vw] sm:max-w-[400px] transform overflow-hidden rounded-xl bg-white 
          shadow-2xl transition-all relative">
                <!-- Header do modal -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <DialogTitle as="h3" class="text-lg lg:text-xl font-bold text-gray-900">
                        Terminar sessao
                    </DialogTitle>
                    <button @click="closeModal" class="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="p-4 space-y-4">
                    <!-- Botão de envio com loading -->
                    <button @click="logout" :disabled="loading" class="w-full rounded-full bg-red-600 py-2 text-white font-medium 
                        hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
                        flex items-center justify-center">
                        <span v-if="!loading">Terminar</span>
                        <svg v-else class="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                        </svg>
                    </button>
                    <button @click="closeModal" :disabled="loading" class="w-full rounded-full py-2 text-gray-500 font-medium 
                        bg-gray-300 
                        flex items-center justify-center">
                        <span>Cancelar</span>
                    </button>
                </div>
            </DialogPanel>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'; // Importa funções do Vue 3
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'; // Importa componentes do Headless UI
import { useAuth } from "@/hooks/auth";
import { useRouter } from 'vue-router';
const { logoutUser, loading } = useAuth()
import Cookies from "js-cookie";

// Props recebidas do componente pai
const props = defineProps({
    modal: {
        type: Object,
        required: true,
    },
});

const router = useRouter()

const emit = defineEmits(['close', 'recover-password']);

const isOpen = computed(() => props.modal.show && props.modal.name === 'logout-user');
const sessionId = Cookies.get("session_id")

const logout = async () => {
    await logoutUser(sessionId).then(() => {
        router.replace({ name: "Login" })
    }).catch(err => {
        alert('Houve um erro ao tentar terminar a sessao.');
    })
};

// Fecha o modal
const closeModal = () => {
    emit('close')
};
</script>

<style scoped>
/* Estilização adicional pode ser adicionada aqui */
</style>