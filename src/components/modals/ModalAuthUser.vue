<!-- ModalLoginUser.vue -->
<script setup>
import { ref, computed } from 'vue'; // Importa funções do Vue 3
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'; // Importa componentes do Headless UI
import { useAuth } from "@/app/auth/auth.hook";
import { useRouter } from 'vue-router';
const { authUser, loading } = useAuth()

// Props recebidas do componente pai
const props = defineProps({
    modal: {
        type: Object,
        required: true,
    },
});

const router = useRouter()

// Emite eventos para o componente pai
const emit = defineEmits(['close', 'recover-password']);

// Estado reativo
const email = ref(''); // Email do usuário
const password = ref(''); // Senha do usuário

// Computa se o modal deve estar aberto
const isOpen = computed(() => props.modal.show && props.modal.name === 'login-user');

// Computa se o formulário é válido
const isValid = computed(() =>
    email.value.trim().length > 0 &&
    password.value.length >= 6
);

// Fecha o modal
const closeModal = () => {
    emit('close');
    resetForm();
};

// Reseta o formulário
const resetForm = () => {
    email.value = '';
    password.value = '';
};

// Abre o modal de recuperacao de senha
const openRecoverPasswordModal = () => {
    emit('recover-password');
};

// Submete o login para a API
const submitLogin = async () => {
    if (!isValid.value) return;
    loading.value = true;

    const formData = {
        email: email.value.trim(),
        password: password.value,
    };

    await authUser(formData).then(() => {
        router.replace({ name: "Home" })
    }).catch(err => {
        resetForm()
        console.error('Erro ao fazer login:', err);
        alert('Erro ao entrar. Verifique suas credenciais e tente novamente.');
    })
};
</script>

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
                        Entrar
                    </DialogTitle>
                    <button @click="closeModal" class="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Formulário de login -->
                <form @submit.prevent="submitLogin" class="p-4 space-y-4">
                    <!-- Campo Email -->
                    <div>
                        <input v-model="email" type="email" placeholder="Email" class="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm sm:text-base 
                            placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <!-- Campo Senha -->
                    <div>
                        <input v-model="password" type="password" placeholder="Senha" class="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm sm:text-base 
                            placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <!-- Botão de envio com loading -->
                    <button type="submit" :disabled="loading || !isValid" class="w-full rounded-full bg-blue-600 py-2 text-white font-medium 
                        hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
                        flex items-center justify-center">
                        <span v-if="!loading">Entrar</span>
                        <svg v-else class="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                        </svg>
                    </button>

                    <!-- Link para registro -->
                    <p class="text-center text-sm text-gray-600">
                        Esqueceu a senha?
                        <button type="button" @click="openRecoverPasswordModal"
                            class="text-blue-600 hover:underline">Redefina aqui</button>
                    </p>
                </form>
            </DialogPanel>
        </div>
    </Dialog>
</template>

<style scoped>
/* Estilização adicional pode ser adicionada aqui */
</style>