<template>
  <p
    class="text-light-text-primary dark:text-dark-text-primary mt-1 whitespace-pre-wrap"
    :class="isBigger ? 'text-base' : 'text-sm'"
    role="paragraph"
    aria-label="Texto do post"
  >
    {{ text }}
  </p>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
    default: '',
  },
  isBigger: {
    type: Boolean,
    default: false
  }
});
</script>