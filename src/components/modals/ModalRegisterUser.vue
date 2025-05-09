<!-- ModalRegisterUser.vue -->
<script setup>
import { ref, computed } from 'vue'; // Importa funções do Vue 3
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'; // Importa componentes do Headless UI
import { useAuth } from "@/hooks/auth";
const { registerUser, loading } = useAuth()

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
const name = ref(''); // Nome do usuário
const email = ref(''); // Email do usuário
const password = ref(''); // Senha do usuário

// Computa se o modal deve estar aberto
const isOpen = computed(() => props.modal.show && props.modal.name === 'register-user');

// Computa se o formulário é válido
const isValid = computed(() =>
    name.value.trim().length > 0 &&
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
    name.value = '';
    email.value = '';
    password.value = '';
};

// Abre o modal de login
const openLoginModal = () => {
    emit('open-login');
};

// Submete o registro para a API
const submitRegistration = async () => {
    if (!isValid.value) return;
    loading.value = true;

    const formData = {
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
    };

    await registerUser(formData).then((res) => {
        closeModal();
        console.log(res)
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
                        Criar conta
                    </DialogTitle>
                    <button @click="closeModal" class="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Formulário de registro -->
                <form @submit.prevent="submitRegistration" class="p-4 space-y-4">
                    <!-- Campo Nome -->
                    <div>
                        <input v-model="name" type="text" maxlength="50" placeholder="Nome" class="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm sm:text-base 
                            placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div class="text-right text-xs text-gray-400 mt-1">
                            {{ name.length }}/50
                        </div>
                    </div>

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
                        <span v-if="!loading">Registrar</span>
                        <svg v-else class="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                        </svg>
                    </button>

                    <!-- Link para login -->
                    <p class="text-center text-sm text-gray-600">
                        Já tem uma conta?
                        <button type="button" @click="openLoginModal"
                            class="text-blue-600 hover:underline">Entrar</button>
                    </p>
                </form>
            </DialogPanel>
        </div>
    </Dialog>
</template>



<style scoped>
/* Estilização adicional pode ser adicionada aqui */
</style>