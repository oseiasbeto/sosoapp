<!-- SearchInput.vue -->
<template>
    <div class="p-[10px] border-2 border-[transparent] px-3 rounded-lg text-light-muted dark:text-dark-text-secondary bg-light-card dark:bg-dark-card cursor-pointer"
        :class="{ '!border-primary': isFocused }" @click="focusInput">
        <div class="flex gap-2 overflow-hidden items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" :class="{ 'text-primary': isFocused }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input style="background: transparent;" ref="searchInput" type="text" v-model="searchQuery"
                @input="handleInput" @keyup.enter="handleSearch" @focus="isFocused = true" @blur="isFocused = false"
                placeholder="Pesquisar postagens, usuários..."
                class="bg-transparent outline-none text-sm w-full text-light-text-primary dark:text-dark-text-primary placeholder-light-muted dark:placeholder-dark-text-secondary" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Estado reativo para o valor da busca
const searchQuery = ref('')

// Estado reativo para o estado de foco
const isFocused = ref(false)

// Referência ao elemento de input
const searchInput = ref(null)

// Definir eventos que serão emitidos para o componente pai
const emit = defineEmits(['search', 'input'])

// Função para focar o input
const focusInput = () => {
    if (searchInput.value) {
        searchInput.value.focus()
    }
}

// Função para lidar com o evento de input (autocomplete)
const handleInput = () => {
    emit('input', searchQuery.value)
}

// Função para lidar com a pesquisa (Enter)
const handleSearch = () => {
    if (searchQuery.value.trim()) {
        emit('search', searchQuery.value)
    }
}

// Foca o input quando o componente é montado
onMounted(() => {
    if (searchInput.value) {
        searchInput.value.focus()
        isFocused.value = true // Define o estado de foco inicial
    }
})
</script>