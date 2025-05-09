<script setup>
import { ref, computed, watch, onUnmounted, nextTick, onMounted } from 'vue';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { usePost } from "@/hooks/posts";
import 'emoji-picker-element';

const props = defineProps({
  replyTo: {
    type: Object,
    default: null,
  }
});

const cancelTokens = ref({});
const { createPost } = usePost()

const emit = defineEmits(['post-created', 'cancel-reply']);

// Refs
const postContent = ref('');
const mediaPreviews = ref([]);
const uploadProgress = ref({});
const isPosting = ref(false);
const error = ref(null);
const textAreaRef = ref(null);
const imageInput = ref(null);
const videoInput = ref(null);
const showEmojiPicker = ref(false);
const emojiPickerContainer = ref(null);
const privacyMenuRef = ref(null)
const privacy = ref("public")
const emojiButtonRef = ref(null)
const emojiPickerRef = ref(null)
const showPrivacyMenu = ref(false)
const privacyOptions = [
  { value: 'public', label: 'Público', icon: '🌐', description: 'Qualquer pessoa pode ver este post' },
  { value: 'followers', label: 'Seguidores', icon: '👥', description: 'Apenas seus seguidores' },
  { value: 'private', label: 'Privado', icon: '🔒', description: 'Apenas você' }
]

// Constantes
const MAX_CHARS = 280;
const MAX_IMAGES = 4;
const MAX_VIDEO_SIZE_MB = 50;
const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';

// Computed
const remainingChars = computed(() => MAX_CHARS - postContent.value.length);
const hasImages = computed(() => mediaPreviews.value.some(m => m.type === 'image'));
const hasVideo = computed(() => mediaPreviews.value.some(m => m.type === 'video'));
const canPost = computed(() => {
  return (
    postContent.value.trim().length > 0 ||
    mediaPreviews.value.length > 0
  ) && remainingChars.value >= 0;
});

const isUploading = computed(() => {
  return Object.values(uploadProgress.value).some(progress => progress < 100);
});

// Métodos
const adjustTextareaHeight = () => {
  if (textAreaRef.value) {
    textAreaRef.value.style.height = 'auto';
    textAreaRef.value.style.height = `${textAreaRef.value.scrollHeight}px`;
  }
};
const currentPrivacy = computed(() => {
  return privacyOptions.find(opt => opt.value === privacy.value) || privacyOptions[0]
})

const initEmojiPicker = () => {
  if (!emojiPickerContainer.value) return;

  emojiPickerContainer.value.innerHTML = '';

  const picker = document.createElement('emoji-picker');
  picker.classList.add('emoji-picker');
  picker.setAttribute('aria-label', 'Seletor de emojis');
  picker.setAttribute('data-testid', 'emoji-picker');

  // Configurações recomendadas
  picker.config = {
    skinToneEmoji: '👍',
    recentsCount: 24,
    defaultSkinTone: 'neutral',
    categories: [
      'smileys',
      'people',
      'animals',
      'food',
      'activities',
      'travel',
      'objects',
      'symbols',
      'flags'
    ]
  };

  picker.addEventListener('emoji-click', (event) => {
    insertEmoji(event);
    showEmojiPicker.value = false;
  });

  emojiPickerContainer.value.appendChild(picker);
};

const togglePrivacyMenu = (e) => {
  e.preventDefault()
  e.stopPropagation()
  showPrivacyMenu.value = !showPrivacyMenu.value
}

const toggleEmojiPicker = (e) => {
  e.preventDefault();
  e.stopPropagation();

  showEmojiPicker.value = !showEmojiPicker.value;

  if (showEmojiPicker.value) {
    nextTick(() => {
      initEmojiPicker();
      positionPicker();
    });
  }
};

const positionPicker = () => {
  if (!emojiPickerRef.value || !emojiButtonRef.value) return;

  const buttonRect = emojiButtonRef.value.getBoundingClientRect();
  const picker = emojiPickerRef.value;

  if (window.innerWidth >= 640) {
    // Posicionamento para desktop
    picker.style.left = `${buttonRect.left}px`;
    picker.style.top = `${buttonRect.bottom + window.scrollY + 8}px`;
  } else {
    // Posicionamento para mobile
    picker.style.left = '0';
    picker.style.right = '0';
    picker.style.bottom = '60px'; // Ajuste conforme necessário
  }
};

const handleResize = () => {
  if (showEmojiPicker.value) {
    positionPicker();
  }
};

const selectPrivacy = (option, event) => {
  event.preventDefault();
  event.stopPropagation();
  privacy.value = option.value;
  closeMenu();
}

const closeMenu = () => {
  showPrivacyMenu.value = false
}


const handleClickOutside = (event) => {
  // Verifica se o clique foi dentro do menu de privacidade ou no botão de toggle
  const clickedInsidePrivacyMenu = privacyMenuRef.value?.contains(event.target) ||
    event.target.closest('button')?.isSameNode(privacyMenuRef.value?.querySelector('button'));

  // Verifica se o clique foi dentro do emoji picker ou no botão de emoji
  const clickedInsideEmojiPicker = emojiPickerRef.value?.contains(event.target) ||
    event.target.closest('button')?.isSameNode(emojiButtonRef.value);

  if (!clickedInsidePrivacyMenu && showPrivacyMenu.value) {
    closeMenu();
  }

  if (!clickedInsideEmojiPicker && showEmojiPicker.value) {
    showEmojiPicker.value = false;
  }
}

const insertEmoji = (event) => {
  const emoji = event.detail.unicode;
  const textarea = textAreaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  postContent.value =
    postContent.value.substring(0, start) +
    emoji +
    postContent.value.substring(end);

  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    adjustTextareaHeight();
  });

  showEmojiPicker.value = false
};

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files || []);

  // Verificar limite de imagens
  const availableSlots = MAX_IMAGES - mediaPreviews.value.length;
  if (files.length > availableSlots) {
    error.value = `Você pode adicionar no máximo ${MAX_IMAGES} imagens`;
    return;
  }

  files.slice(0, availableSlots).forEach(file => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const id = uuidv4();
      mediaPreviews.value.push({
        id,
        url: e.target.result,
        type: 'image',
        format: file.type.split('/')[1],
        file
      });
    };
    reader.readAsDataURL(file);
  });

  // Resetar input
  e.target.value = '';
};

const handleVideoUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith('video/')) return;

  // Verificar tamanho do vídeo
  if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    error.value = `O vídeo deve ter no máximo ${MAX_VIDEO_SIZE_MB}MB`;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const id = uuidv4();
    mediaPreviews.value = [{ // Substitui qualquer mídia existente (só permite 1 vídeo)
      id,
      url: e.target.result,
      type: 'video',
      format: file.type.split('/')[1],
      file
    }];
  };
  reader.readAsDataURL(file);

  // Resetar input
  e.target.value = '';
};

// Modifique a função removeMedia para cancelar uploads
const removeMedia = (index) => {
  const media = mediaPreviews.value[index];

  // Cancelar o upload se estiver em progresso
  if (uploadProgress.value[media.id] !== undefined && cancelTokens.value[media.id]) {
    cancelTokens.value[media.id].cancel('Upload cancelado pelo usuário');
    delete cancelTokens.value[media.id];
  }

  // Remover da lista de previews
  mediaPreviews.value.splice(index, 1);

  // Remover do progresso
  const newProgress = { ...uploadProgress.value };
  delete newProgress[media.id];
  uploadProgress.value = newProgress;
};

const uploadMedia = async (media) => {
  const source = axios.CancelToken.source();
  cancelTokens.value[media.id] = source;

  try {
    const formData = new FormData();
    formData.append('file', media.file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);

    // Adiciona o parâmetro folder baseado no tipo de mídia
    formData.append('folder', media.type === 'video' ? 'videos' : 'images');

    if (media.type === 'video') {
      formData.append('resource_type', 'video');
      const publicId = `video_${Date.now()}`;
      formData.append('public_id', publicId);
    }

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      formData,
      {
        cancelToken: source.token, // Adicione o cancelToken aqui
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          uploadProgress.value = {
            ...uploadProgress.value,
            [media.id]: progress
          };
        },
      }
    );

    // Limpar o token após conclusão
    delete cancelTokens.value[media.id];

    if (!response.data) return null;

    // Construir URL do HLS manualmente
    const hlsUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_hd/${response.data.public_id}.m3u8`;

    const thumbnailUrl = media.type === 'video' ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${response.data.width},h_${response.data.height},c_fill,q_auto,f_jpg,so_2/${response.data.public_id}.jpg` : null;

    return {
      public_id: response.data.public_id,
      url: media.type === 'video' ? hlsUrl : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,w_1200/${response.data.public_id}`,
      thumbnail: thumbnailUrl,
      type: media.type,
      format: media.type === 'video' ? 'm3u8' : response.data.format,
      width: response.data.width,
      height: response.data.height,
      duration: media.type === 'video' ? await getVideoDuration(response.data.secure_url) : null
    };
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Upload cancelado:', error.message);
      return null;
    }
    throw error;
  }
};

// Função auxiliar para obter duração do vídeo
const getVideoDuration = (url) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => {
      resolve(null); // Fallback se não conseguir obter
    };
  });
};

const handleSubmit = async () => {
  if (!canPost.value) return;

  isPosting.value = true;
  error.value = null;

  try {
    // Upload de mídias primeiro
    const mediaUploads = mediaPreviews.value.map(media => uploadMedia(media));
    const uploadedMedia = (await Promise.all(mediaUploads)).filter(Boolean); // Filtra resultados nulos (cancelados)

    // Verificar se ainda há mídias válidas após possíveis cancelamentos
    const validMedia = uploadedMedia.filter(m => m !== null);

    const postData = {
      content: postContent.value,
      media: validMedia.map(m => ({
        public_id: m.public_id,
        url: m.url,
        type: m.type,
        format: m.format,
        thumbnail: m.thumbnail,
        width: m.width,
        height: m.height,
        duration: m.duration
      })),
      privacy: privacy.value,
      ...(props.replyTo && {
        isReply: true,
        originalPost: props.replyTo._id
      })
    };

    // Verificar se ainda há conteúdo para postar
    if (postData.content || postData.media.length > 0) {
      await createPost(postData).then(res => {
        postContent.value = '';
        mediaPreviews.value = [];
        uploadProgress.value = {};
        cancelTokens.value = {}; // Limpar todos os tokens
        privacy.value = 'public'; // Reset to default
        emit('post-created', res.data);
      });
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao criar post';
  } finally {
    isPosting.value = false;
  }
};

// Ajustar altura do textarea quando conteúdo mudar
watch(postContent, () => {
  nextTick(adjustTextareaHeight);
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize);
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
    <!-- Cabeçalho para replies -->
    <div v-if="replyTo" class="flex justify-between items-center mb-3">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        Respondendo a @{{ replyTo.author.username }}
      </p>
      <button @click="emit('cancel-reply')" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        ✕
      </button>
    </div>

    <!-- Formulário principal -->
    <form @submit.prevent="handleSubmit">
      <!-- Área de texto -->
      <textarea v-model="postContent" ref="textAreaRef" placeholder="O que está acontecendo?"
        class="w-full bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 mb-3"
        rows="1" @input="adjustTextareaHeight"></textarea>


      <!-- Pré-visualização de mídias -->
      <div v-if="mediaPreviews.length" class="grid grid-cols-2 gap-2 mb-3">
        <div v-for="(media, index) in mediaPreviews" :key="media.id" class="relative rounded-lg overflow-hidden" :class="{
          'col-span-2': mediaPreviews.length === 1,
          'h-48': mediaPreviews.length > 1,
          'h-64': mediaPreviews.length === 1,
          'opacity-70': uploadProgress[media.id] !== undefined && media.type === 'image',
          'transition-opacity duration-300': uploadProgress[media.id] !== undefined
        }">
          <!-- Imagens -->
          <img v-if="media.type === 'image'" :src="media.url" class="w-full h-full object-cover" />
          <!-- Vídeos -->

          <video v-if="media.type === 'video'" controls class="w-full h-full object-cover">
            <source :src="media.url" :type="'video/' + media.format" />
          </video>

          <!-- Botão de remover -->
          <button @click.stop="removeMedia(index)"
            class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5 text-white">
              <g>
                <path fill="currentColor"
                  d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                </path>
              </g>
            </svg>
          </button>
        </div>
      </div>

      <!-- Seletor de Privacidade Moderno -->
      <div class="relative mb-3" ref="privacyMenuRef">
        <button type="button" @click="togglePrivacyMenu" @mousedown.stop
          class="flex items-center space-x-1 text-sm font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span>{{ currentPrivacy.icon }}</span>
          <span>{{ currentPrivacy.label }}</span>
          <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showPrivacyMenu }"
            fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"></path>
          </svg>
        </button>

        <!-- Menu de Privacidade -->
        <transition enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <div v-if="showPrivacyMenu" @click.stop
            class="absolute z-10 mt-1 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
            <div class="p-1">
              <div class="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                QUEM PODE VER ISSO?
              </div>
              <div v-for="option in privacyOptions" :key="option.value" @click="selectPrivacy(option, $event)"
                class="flex items-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                :class="{ 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400': privacy === option.value }">
                <span class="mr-2 text-lg">{{ option.icon }}</span>
                <div>
                  <div class="font-medium">{{ option.label }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ option.description }}</div>
                </div>
                <svg v-if="privacy === option.value" class="ml-auto h-5 w-5 text-blue-500" fill="currentColor"
                  viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Upload progress indicator -->
      <div v-if="isUploading" class="flex items-center mb-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <div class="relative w-7 h-7 mr-2">
          <svg class="w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" class="stroke-blue-200 dark:stroke-blue-700" stroke-width="3">
            </circle>
            <circle cx="18" cy="18" r="16" fill="none" class="stroke-blue-500" stroke-width="3" stroke-dasharray="100"
              stroke-dashoffset="100" :style="{
                'stroke-dashoffset': 100 - Math.max(...Object.values(uploadProgress)),
                'transition': 'stroke-dashoffset 0.3s ease'
              }"></circle>
          </svg>
          <span
            class="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
            {{ Math.max(...Object.values(uploadProgress)) }}
          </span>
        </div>
        <span class="text-sm text-blue-600 dark:text-blue-300">Enviando o vídeo...</span>
      </div>

      <!-- Barra de ferramentas -->
      <div class="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <!-- Botões de mídia -->
        <div class="flex">
          <input type="file" ref="imageInput" accept="image/*" multiple @change="handleImageUpload" class="hidden" />
          <button type="button" @click="imageInput?.click()" :disabled="hasVideo"
            class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
            title="Adicionar imagens">
            <svg fill="none" class="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" style="">
              <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm2 1v7.213l1.246-.932.044-.03a3 3 0 0 1 3.863.454c1.468 1.58 2.941 2.749 4.847 2.749 1.703 0 2.855-.555 4-1.618V5H5Zm14 10.357c-1.112.697-2.386 1.097-4 1.097-2.81 0-4.796-1.755-6.313-3.388a1 1 0 0 0-1.269-.164L5 14.712V19h14v-3.643ZM15 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z">
              </path>
            </svg>
          </button>

          <input type="file" ref="videoInput" accept="video/*" @change="handleVideoUpload" class="hidden" />
          <button type="button" @click="videoInput?.click()" :disabled="hasImages"
            class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
            title="Adicionar vídeo">
            <svg fill="none" class="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" style="">
              <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4Zm2 1v2h2V5H5Zm4 0v6h6V5H9Zm8 0v2h2V5h-2Zm2 4h-2v2h2V9Zm0 4h-2v2h2V13Zm0 4h-2V19h2ZM15 19v-6H9v6h6Zm-8 0v-2H5v2h2Zm-2-4h2v-2H5v2Zm0-4h2V9H5v2Z">
              </path>
            </svg>
          </button>

          <!-- Botão de emoji -->
          <button ref="emojiButtonRef" type="button" @click="toggleEmojiPicker"
            class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full" title="Adicionar emoji">
            <svg fill="none" class="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm8-5a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm-5.894 7.803a1 1 0 0 1 1.341-.447c1.719.859 3.387.859 5.106 0a1 1 0 1 1 .894 1.788c-2.281 1.141-4.613 1.141-6.894 0a1 1 0 0 1-.447-1.341Z">
              </path>
            </svg>
          </button>

          <!-- Seletor de emoji (aparece quando showEmojiPicker é true) -->
          <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <div v-if="showEmojiPicker" ref="emojiPickerRef" @click.stop
              class="fixed w-min rounded-lg sm:absolute z-20 bottom-4 sm:bottom-auto sm:left-0 sm:mt-2 shadow-lg origin-top-left">
              <div ref="emojiPickerContainer" class="w-[350px] h-[400px] sm:w-full sm:h-full"></div>
            </div>
          </transition>
        </div>

        <!-- Contador e botão de postar -->
        <div class="flex items-center space-x-3">
          <span class="text-sm" :class="{
            'text-gray-500': remainingChars >= 20,
            'text-yellow-500': remainingChars < 20 && remainingChars >= 0,
            'text-red-500': remainingChars < 0
          }">
            {{ remainingChars }}
          </span>
          <button type="submit" :disabled="isPosting || !canPost"
            class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isPosting">Postando...</span>
            <span v-else>{{ replyTo ? 'Responder' : 'Postar' }}</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Mensagens de erro -->
    <div v-if="error" class="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative">
      <span class="block text-xs sm:inline">{{ error }}</span>
      <button @click="error = null" class="absolute top-0 bottom-0 right-0 px-3">
        ✕
      </button>
    </div>
  </div>
</template>

<style>
</style>