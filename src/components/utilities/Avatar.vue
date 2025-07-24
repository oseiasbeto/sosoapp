<template>
    <div class="bg-light-card dark:bg-dark-card shrink-0 relative overflow-hidden rounded-full border border-light-border dark:border-dark-border"
        :class="[sizeClasses]" role="img" :aria-label="`Avatar de ${altText || 'nome'}`">
        <img v-lazy="props?.src" :alt="`Avatar de ${altText || 'nome'}`" class=" w-full h-full object-cover"
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
        default: 'Usuário',
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['xs', 'big', 'sm', 'md', 'lg'].includes(value),
    },
});

// Classes dinâmicas para tamanhos
const sizeClasses = computed(() => {
    return {
        xs: 'w-5 h-5',
        sm: 'w-8 h-8',
        md: 'w-11 h-11',
        lg: 'w-12 h-12',
        big: 'w-[90px] h-[90px]'
    }[props.size] || 'w-11 h-11';
});

</script>