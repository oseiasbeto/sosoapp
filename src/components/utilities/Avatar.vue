<template>
    <div class=" shrink-0 relative overflow-hidden rounded-full border border-light-border dark:border-dark-border"
        :class="[sizeClasses]" role="img" :aria-label="`Avatar de ${altText}`">
        <img v-lazy="props.src" :alt="`Avatar de ${altText}`" class=" w-full h-full object-cover"
            :class="[sizeClasses]" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
    src: {
        type: String,
        required: true,
        default: '',
    },
    altText: {
        type: String,
        required: true,
        default: 'Usuário',
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
});

// Estado de carregamento
const isLoading = ref(true);

// Configuração do VueLazyload
const placeholder = '/assets/placeholder.png'; // Ajuste o caminho
const fallback = '/assets/fallback-user.png'; // Ajuste o caminho

// Classes dinâmicas para tamanhos
const sizeClasses = computed(() => {
    return {
        sm: 'w-8 h-8',
        md: 'w-11 h-11',
        lg: 'w-12 h-12',
    }[props.size] || 'w-11 h-11';
});

</script>