<template>
  <div @click="handleTap" class="relative flex items-center w-full h-full bg-black overflow-hidden">
    <!-- Vídeo -->
    <video ref="videoRef" :poster="props.video.thumbnail || defaultThumb" class="w-full h-auto my-auto object-cover"
      playsinline preload="metadata" @timeupdate="updateProgress" @ended="onVideoEnded" @waiting="onWaiting"
      @playing="onPlaying" @loadedmetadata="onLoadedMetadata"></video>

    <!-- Overlay de loading -->
    <div v-if="isBuffering" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div class="w-10 h-10 border-4 border-[#fff] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Controles (aparecem com interação) -->
    <div @click.stop class="w-full flex items-center transition-opacity fixed bottom-8 z-10"
      :class="{ 'opacity-0': !showControls }">
      <div class="shrink-0">
        <button class="p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75" @click.stop="togglePlay"
          aria-label="Alternar reprodução">
          <svg v-if="isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
          </svg>
          <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </button>
      </div>

      <!-- Barra de progresso e tempo -->
      <div class="px-4 flex-1 flex items-center gap-3 text-white text-xs">
        <span class="font-medium">{{ currentTimeFormatted }} / {{ durationFormatted }}</span>
        <div ref="progressBar" class="flex-1 h-1.5 bg-gray-800 bg-opacity-50 rounded-full cursor-pointer relative"
          @mousedown="startDragging" @touchstart.passive="startDragging" @click="seekVideo">
          <div v-if="bufferProgress > progress" :style="{ width: `${bufferProgress}%` }"
            class="absolute h-full bg-[#fff] bg-opacity-50 rounded-full"></div>
          <div :style="{ width: `${progress}%` }"
            class="absolute h-full bg-[#fff] rounded-full transition-[width] duration-100"
            :class="{ 'bg-blue-500': isDragging }">
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#fff] rounded-full"
              :class="{ 'w-4 h-4 bg-blue-500': isDragging }"></div>
          </div>
          <!-- Tooltip de tempo durante o arrasto -->
          <div v-if="isDragging" class="absolute -top-8 text-xs bg-black bg-opacity-80 text-white px-2 py-1 rounded"
            :style="{ left: `${progress}%`, transform: 'translateX(-50%)' }">
            {{ draggingTimeFormatted }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Hls from 'hls.js';

const props = defineProps({
  video: {
    type: Object,
    required: true,
    validator: (video) => 'url' in video,
  },
});

const defaultThumb = 'https://via.placeholder.com/400x400?text=Thumbnail+Indisponível';

// Estados reativos
const videoRef = ref(null);
const progressBar = ref(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const isBuffering = ref(false);
const progress = ref(0);
const bufferProgress = ref(0);
const videoLoaded = ref(false);
const hlsInstance = ref(null);
const currentTime = ref(0);
const duration = ref(props.video.duration || 0);
const showControls = ref(true);
const isDragging = ref(false);
const draggingTime = ref(0);

// Carregar vídeo com HLS.js
const loadHls = () => {
  if (videoLoaded.value || !videoRef.value || !props.video.url) return;

  if (hlsInstance.value) {
    hlsInstance.value.destroy();
    hlsInstance.value = null;
  }

  const video = videoRef.value;
  if (Hls.isSupported()) {
    hlsInstance.value = new Hls({
      autoStartLoad: false,
      startLevel: -1,
      maxBufferLength: 5,
      maxMaxBufferLength: 10,
      lowLatencyMode: true,
      enableWorker: true,
      backBufferLength: 0,
      liveSyncDuration: 0.5,
    });
    hlsInstance.value.loadSource(props.video.url);
    hlsInstance.value.attachMedia(video);
    hlsInstance.value.on(Hls.Events.MANIFEST_PARSED, () => {
      videoLoaded.value = true;
      video.muted = isMuted.value;
      hlsInstance.value.startLoad(); // Inicia o carregamento do buffer
      updateBufferProgress();
    });
    hlsInstance.value.on(Hls.Events.BUFFER_APPENDED, () => {
      updateBufferProgress();
    });
    hlsInstance.value.on(Hls.Events.ERROR, (event, data) => {
      console.error('Erro HLS:', data);
      if (data.fatal) {
        hlsInstance.value.destroy();
        hlsInstance.value = null;
        isBuffering.value = true;
        setTimeout(loadHls, 1000);
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = props.video.url;
    video.muted = isMuted.value;
    videoLoaded.value = true;
    video.load(); // Inicia o carregamento do buffer
  }
};

// Atualizar progresso do buffer
const updateBufferProgress = () => {
  const video = videoRef.value;
  if (video && video.buffered.length > 0 && video.duration) {
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    bufferProgress.value = Math.min((bufferedEnd / video.duration) * 100, 100);
  }
};

// Tocar vídeo
const playVideo = async () => {
  const video = videoRef.value;
  if (!video || isPlaying.value) return;

  if (!videoLoaded.value) {
    isBuffering.value = true;
    loadHls();
    await new Promise((resolve) => {
      video.addEventListener('canplaythrough', resolve, { once: true });
    });
  }

  try {
    video.muted = isMuted.value;
    await video.play();
    isPlaying.value = true;
    isBuffering.value = false;
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      isMuted.value = true;
      video.muted = true;
      await video.play();
      isPlaying.value = true;
      isBuffering.value = false;
    } else {
      isBuffering.value = true;
    }
  }
};

// Pausar vídeo
const pauseVideo = () => {
  const video = videoRef.value;
  if (video && isPlaying.value) {
    video.pause();
    isPlaying.value = false;
  }
};

// Alternar play/pause
const togglePlay = () => {
  if (isPlaying.value) {
    pauseVideo();
  } else {
    playVideo();
  }
  showControls.value = true;
  resetControlsTimeout();
};

// Manipular toque (tap zones)
const handleTap = async () => {
  if (!videoRef.value || !videoLoaded.value || !progressBar.value) {
    await playVideo();
  } else {
    showControls.value = !showControls.value;
    resetControlsTimeout();
  }
};

// Iniciar arrasto
const startDragging = (event) => {
  if (!videoRef.value || !videoLoaded.value || !progressBar.value) return;

  isDragging.value = true;
  const wasPlaying = isPlaying.value;
  if (wasPlaying) pauseVideo();
  updateDraggingTime(event);

  const handleMove = (moveEvent) => {
    if (moveEvent.cancelable) {
      moveEvent.preventDefault(); // Só previne se for cancelável
    }
    updateDraggingTime(moveEvent);
    showControls.value = true;
    resetControlsTimeout();
  };

  const handleEnd = async () => {
    // Limpa os listeners primeiro para evitar conflitos
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleEnd);

    isDragging.value = false;
    const video = videoRef.value;
    const targetTime = Math.min(draggingTime.value, video.duration - 0.1);
    const bufferedEnd = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0;

    video.currentTime = targetTime;
    progress.value = (video.currentTime / video.duration) * 100;

    if (targetTime >= bufferedEnd) {
      isBuffering.value = true;
      try {
        await new Promise((resolve) => {
          const canplayHandler = () => {
            video.removeEventListener('canplay', canplayHandler);
            resolve();
          };
          video.addEventListener('canplay', canplayHandler);
        });
      } catch (e) {
        console.error('Error waiting for buffer:', e);
      }
    }

    if (wasPlaying || targetTime < video.duration - 0.1) {
      await playVideo().catch(e => console.error('Play error:', e));
    }

    showControls.value = true;
    resetControlsTimeout();
  };

  // Adiciona listeners com opções corretas
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd, { once: true });
  document.addEventListener('touchmove', handleMove, { passive: false });
  document.addEventListener('touchend', handleEnd, { once: true });
};

// Atualizar tempo durante arrasto
const updateDraggingTime = (event) => {
  const video = videoRef.value;
  const progressBarRect = progressBar.value.getBoundingClientRect();
  const clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
  const clickPosition = Math.max(0, Math.min(clientX - progressBarRect.left, progressBarRect.width));
  const percentage = clickPosition / progressBarRect.width;
  draggingTime.value = Math.min(percentage * (video.duration || props.video.duration || 0), video.duration - 0.1);
  progress.value = Math.min((draggingTime.value / video.duration) * 100, 100);
};

// Buscar vídeo (clique único)
const seekVideo = async (event) => {
  const video = videoRef.value;
  if (!video || !videoLoaded.value || isDragging.value) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const clickPosition = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const percentage = clickPosition / rect.width;
  const targetTime = Math.min(percentage * (video.duration || props.video.duration || 0), video.duration - 0.1);

  video.currentTime = targetTime;
  progress.value = (video.currentTime / video.duration) * 100;

  const bufferedEnd = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0;
  if (targetTime >= bufferedEnd) {
    isBuffering.value = true;
    await new Promise((resolve) => {
      video.addEventListener('canplay', resolve, { once: true });
    });
  }

  if (!isPlaying.value) {
    await playVideo();
  }

  showControls.value = true;
  resetControlsTimeout();
};

// Atualizar progresso com requestAnimationFrame
const updateProgress = () => {
  const video = videoRef.value;
  if (video && video.duration && !isDragging.value) {
    currentTime.value = video.currentTime;
    progress.value = Math.min((video.currentTime / video.duration) * 100, 100);
  }
  if (isPlaying.value && !isDragging.value) {
    requestAnimationFrame(updateProgress);
  }
};

// Eventos do vídeo
const onVideoEnded = () => {
  const video = videoRef.value;
  if (video) {
    video.currentTime = 0;
    isPlaying.value = false;
    isBuffering.value = false;
    progress.value = 0;
    currentTime.value = 0;
    showControls.value = true;
  }
};

const onWaiting = () => {
  isBuffering.value = true; // Ativa o spinner durante qualquer espera
};

const onPlaying = () => {
  isBuffering.value = false;
  if (isPlaying.value && !isDragging.value) {
    requestAnimationFrame(updateProgress);
  }
};

const onLoadedMetadata = () => {
  duration.value = videoRef.value.duration || props.video.duration || 0;
  isBuffering.value = false; // Desativa o spinner quando os metadados estão carregados
};

// Formatar tempo
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
};

const currentTimeFormatted = computed(() => formatTime(currentTime.value));
const draggingTimeFormatted = computed(() => formatTime(draggingTime.value));
const durationFormatted = computed(() => formatTime(duration.value));

// Timeout para ocultar controles
const resetControlsTimeout = () => {
  clearTimeout(window.controlsTimeout);
  window.controlsTimeout = setTimeout(() => {
    showControls.value = false;
  }, 3000);
};

onUnmounted(() => {
  pauseVideo();
  if (hlsInstance.value) {
    hlsInstance.value.destroy();
    hlsInstance.value = null;
  }
  if (videoRef.value) {
    videoRef.value.src = '';
    videoRef.value.load();
  }
  clearTimeout(window.controlsTimeout);
});
</script>