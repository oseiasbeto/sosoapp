<template>
    <!-- Container do dialog do Headless UI -->
    <Dialog :open="show" class="relative z-50">
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
                        Excluir esta postagem?
                    </DialogTitle>
                </div>

                <!--start content-->
                <div>
                    <p>Se você remover esta postagem, você não poderá recuperá-la.</p>
                </div>
                <!--end content-->

                <div class="p-4 space-y-4">
                    <!-- Botão de envio com loading -->
                    <button @click="confirm(true)" class="w-full rounded-full bg-red-600 py-2 text-white font-medium 
                        hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
                        flex items-center justify-center">
                        <span >Excluir</span>
                       
                    </button>
                    <button @click="confirm(false)" class="w-full rounded-full py-2 text-gray-500 font-medium 
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
import { computed } from 'vue'; // Importa funções do Vue 3
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'; // Importa componentes do Headless UI

// Props recebidas do componente pai
defineProps({
    show: {
        type: Boolean,
        required: false,
    }
});

const emit = defineEmits(['onChange']);

// Fecha o modal
const confirm = (value) => {
    emit('onChange', value)
};
</script>

<style scoped>
/* Estilização adicional pode ser adicionada aqui */
</style>