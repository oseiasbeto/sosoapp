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
                        Mais opcoes
                    </DialogTitle>
                    <button @click="closeDrawer" class="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="p-4">
                    <ul>
                        <li>
                            <button class="p-1 w-max">Nao quero ver isto</button>
                        </li>
                        <li v-if="isAuthor && isAuthorFromOriginalPost">
                            <button @click="showDeletePostDialog = true" class="p-1 w-max">Eliminar
                                postagem</button>
                        </li>
                    </ul>
                </div>
            </DialogPanel>
        </div>

        <ModalDeletePost :show="showDeletePostDialog && isOpen" @on-change="confirmDeletePost" />
    </Dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'; // Importa funções do Vue 3
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'; // Importa componentes do Headless UI
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { usePost } from "../../app/posts/posts.hook";
import ModalDeletePost from '../modals/ModalDeletePost.vue';
const { deletePost, loading: loadingDeletePost } = usePost()

const store = useStore()
const router = useRouter()
const route = useRoute()

const showDeletePostDialog = ref(false)

const user = computed(() => store.getters.currentUser)
const drawer = computed(() => store.getters.drawerContent)
const originalPost = computed(() => drawer.value.data?.originalPost)
const postModule = computed(() => drawer.value.data?.postModule)
const isAuthor = computed(() => originalPost.value?.author?._id === user.value?._id)

const isAuthorFromOriginalPost = computed(() => {
    if (!originalPost.value?.is_repost) return true
    else {
        return originalPost.value?.original_post.author?._id === user.value?._id
    }
})

const drawerName = 'post_more_options'

const isOpen = computed(() => {
    if (route.query.drawer_show && drawer.value.show && route.query.drawer_show === drawerName && drawer.value.name === drawerName) return true
    else return false
});

const emit = defineEmits(['onPostDeleted'])

const handleDeletePost = (post) => {
    deletePost({
        postId: post?._id,
        postModule: postModule?.value,
        isViewPage: route.params.id === post?._id,
        isReply: post?.is_reply
    })
    closeDrawer()
    if (route.name === 'Post details' && route.params.id === post._id) {
        router.back()
    }
}

const confirmDeletePost = (value) => {
    if (value) {
        handleDeletePost(originalPost?.value?.is_repost ? originalPost.value?.original_post : originalPost?.value)
    } else {
        showDeletePostDialog.value = false
    }
}

// Fecha o modal
const closeDrawer = () => {
    router.back()
    store.dispatch("closeDrawer")
};

watch(() => isOpen.value, async (newValue, oldValue) => {
    if (!newValue) {
        showDeletePostDialog.value = false
    }
});

</script>

<style scoped>
/* Estilização adicional pode ser adicionada aqui */
</style>