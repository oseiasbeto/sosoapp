<!-- src/components/PullToRefresh.vue -->
<template>
  <div class="pull-to-refresh" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
    <div v-if="isPulling" class="refresh-indicator">
      {{ isRefreshing ? 'Atualizando...' : 'Puxe para atualizar' }}
    </div>
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  onRefresh: { type: Function, required: true },
});

const startY = ref(0);
const currentY = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
const threshold = 20; // Distância reduzida para disparo rápido

const preventDefaultTouchMove = (event) => {
  if (window.scrollY === 0 && event.cancelable && !isRefreshing.value) {
    event.preventDefault();
  }
};

onMounted(() => {
  document.addEventListener('touchmove', preventDefaultTouchMove, { passive: false });
});

onUnmounted(() => {
  document.removeEventListener('touchmove', preventDefaultTouchMove, { passive: false });
});

const onTouchStart = (event) => {
  if (!isRefreshing.value && window.scrollY === 0) {
    startY.value = event.touches[0].clientY;
    isPulling.value = true;
  }
};

const onTouchMove = (event) => {
  if (isPulling.value && !isRefreshing.value) {
    currentY.value = event.touches[0].clientY;
    const distance = currentY.value - startY.value;
    isPulling.value = distance > threshold;
  }
};

const onTouchEnd = async () => {
  if (isPulling.value && currentY.value - startY.value > threshold) {
    isRefreshing.value = true;
    try {
      await props.onRefresh();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      isRefreshing.value = false;
      isPulling.value = false;
    }
  } else {
    isPulling.value = false;
  }
};
</script>

<style scoped>
.pull-to-refresh {
  position: relative;
  touch-action: pan-y;
}

.refresh-indicator {
  position: absolute;
  top: -40px;
  width: 100%;
  text-align: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-out; /* Animação suave */
}

.refresh-indicator::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #ccc;
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>