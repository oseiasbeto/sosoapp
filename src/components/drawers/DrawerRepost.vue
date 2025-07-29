<template>
    <!-- Container do dialog do Headless UI -->
    <Dialog :open="isOpen" class="relative z-50">
        <!-- Overlay de fundo escurecido -->
        <div class="fixed inset-0 bg-gray-500/30" aria-hidden="true" />

        <!-- Container centralizado do modal -->
        <div class="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
            <!-- Painel do modal -->
            <DialogPanel class="w-full max-w-[95vw] sm:max-w-[400px] transform overflow-hidden rounded-xl bg-white 
          shadow-2xl transition-all relative">
                <!-- Header do modal -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <DialogTitle as="h3" class="text-lg lg:text-xl font-bold text-gray-900">
                        Deseja repostar?
                    </DialogTitle>
                    <button @click="closeDrawer" class="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="p-4">
                    <!-- Botão de envio com loading -->

                    <div class="space-y-4">
                        <button
                            @click="handleReply(drawer?.data?.originalPost, drawer?.data?.isPost, drawer?.data?.isViewPage, drawer?.data?.postModule, drawer?.data?.isRepost)"
                            :disabled="loading" class="w-full rounded-full bg-gray-600 py-2 text-white font-medium 
                        hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
                        flex items-center justify-center">
                            <div v-if="!loading">
                                <p v-if="!hasReposted">Repostar</p>
                                <p v-else>Desfazer</p>
                            </div>
                            <svg v-else class="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                            </svg>
                        </button>
                        <button @click="closeDrawer" :disabled="loading" class="w-full rounded-full py-2 text-gray-500 font-medium 
                        bg-gray-300 
                        flex items-center justify-center">
                            <span>Cancelar</span>
                        </button>
                    </div>
                </div>
            </DialogPanel>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Importa funções do Vue 3
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'; // Importa componentes do Headless UI
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { usePost } from "@/hooks/posts";
const { toggleRepost, loading } = usePost()

const store = useStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => store.getters.currentUser)
const drawer = computed(() => store.getters.drawerContent)
const originalPostIdParams = computed(() => route.params.id)
const hasReposted = computed(() => drawer.value?.data?.originalPost?.reposts.includes(user.value?._id))
const drawerName = 'repost'

const isOpen = computed(() => {
    if (route.query.drawer_show && drawer.value.show && route.query.drawer_show === drawerName && drawer.value.name === drawerName) return true
    else return false
});

const handleReply = async (originalPost, isPost, isViewPage, postModule, isRepost) => {
    toggleRepost({ originalPost, isPost, isViewPage, postModule, isRepost })
    closeDrawer()
}

// Fecha o modal
const closeDrawer = () => {
    router.back()
    store.dispatch("closeDrawer")
};

</script>

<style scoped>
/* Estilização adicional pode ser adicionada aqui */
</style>