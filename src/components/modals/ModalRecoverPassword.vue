<!-- ModalRecoverPassword.vue -->
<script setup>
import { ref, computed } from 'vue'; // Importa funções do Vue 3
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'; // Importa componentes do Headless UI

// Props recebidas do componente pai
const props = defineProps({
    modal: {
        type: Object,
        required: true,
    },
});

// Emite eventos para o componente pai
const emit = defineEmits(['close', 'open-login']);

// Estado reativo
const email = ref(''); // Email do usuário
const isSubmitting = ref(false); // Estado de envio do formulário

// Computa se o modal deve estar aberto
const isOpen = computed(() => props.modal.show && props.modal.name === 'recover-password');

// Computa se o formulário é válido
const isValid = computed(() => email.value.trim().length > 0);

// Fecha o modal
const closeModal = () => {
    emit('close');
    resetForm();
};

// Reseta o formulário
const resetForm = () => {
    email.value = '';
};

// Abre o modal de login
const openLoginModal = () => {
    emit('open-login');
};

// Submete a solicitação de recuperação para a API
const submitRecovery = async () => {
    if (!isValid.value) return;
    isSubmitting.value = true;
    try {
        const formData = {
            email: email.value.trim(),
        };

        console.log('Solicitação de recuperação enviada para a API:', formData);

        // Simulação de delay para mostrar o loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simula sucesso
        alert('Um link de redefinição foi enviado para o seu email.');
        closeModal();
    } catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error);
        alert('Erro ao enviar o link. Verifique o email e tente novamente.');
    } finally {
        isSubmitting.value = false;
    }
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
                shadow-2xl transition-all relative dark:bg-gray-900 dark:text-white">
                <!-- Header do modal -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <DialogTitle as="h3" class="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                        Recuperar Senha
                    </DialogTitle>
                    <button @click="closeModal" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Formulário de recuperação -->
                <form @submit.prevent="submitRecovery" class="p-4 space-y-4">
                    <!-- Mensagem informativa -->
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Insira seu email para receber um link de redefinição de senha.
                    </p>

                    <!-- Campo Email -->
                    <div>
                        <input v-model="email" type="email" placeholder="Email"
                            class="w-full resize-none rounded-lg border p-3 text-sm sm:text-base 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                            border-gray-200 placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-700 
                            dark:text-white dark:placeholder:text-gray-400" />
                    </div>

                    <!-- Botão de envio com loading -->
                    <button type="submit" :disabled="isSubmitting || !isValid"
                        class="w-full rounded-full bg-blue-600 py-2 text-white font-medium 
                        hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
                        flex items-center justify-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-600">
                        <span v-if="!isSubmitting">Enviar Link</span>
                        <svg v-else class="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                        </svg>
                    </button>

                    <!-- Link para voltar ao login -->
                    <p class="text-center text-sm text-gray-600 dark:text-gray-400">
                        Lembrou da senha? 
                        <button type="button" @click="openLoginModal" 
                            class="text-blue-600 hover:underline dark:text-blue-400">
                            Voltar ao login
                        </button>
                    </p>
                </form>
            </DialogPanel>
        </div>
    </Dialog>
</template>

<style scoped>
/* Estilização adicional pode ser adicionada aqui */
</style>