<script setup>
import { ref, computed, watch, onUnmounted, nextTick, onMounted } from 'vue';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { usePost } from "@/hooks/posts";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';

const props = defineProps({
  modal: {
    type: Object,
    required: true,
  },
});

const cancelTokens = ref({});
const { createPost } = usePost();

const emit = defineEmits(['close', 'post-created']);

// Refs
const postContent = ref('');
const mediaPreviews = ref([]);
const uploadProgress = ref({});
const isPosting = ref(false);
const error = ref(null);
const textAreaRef = ref(null);
const imageInput = ref(null);
const videoInput = ref(null);
const privacy = ref("public");
const privacyMenuRef = ref(null);
const showPrivacyMenu = ref(false);
const showEmojiPicker = ref(false);

const privacyOptions = [
  {
    value: 'public',
    label: 'Público',
    description: 'Qualquer pessoa pode ver este post',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.09m-.09 12h5.91m-8-12h10M3 21h18M3 3h18"/></svg>`
  },
  {
    value: 'followers',
    label: 'Seguidores',
    description: 'Apenas seus seguidores',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
  },
  {
    value: 'private',
    label: 'Privado',
    description: 'Apenas você',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6l-7-2-7 2v6a2 2 0 002 2zm4-14V7a4 4 0 00-8 0v4h8z"/></svg>`
  }
];

// Constants
const MAX_CHARS = 280;
const MAX_IMAGES = 4;
const MAX_VIDEO_SIZE_MB = 50;
const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';

// Computed
const isOpen = computed(() => props.modal.show && props.modal.name === 'create-post');
const replyTo = computed(() => props.modal.data?.replyTo || null);
const remainingChars = computed(() => MAX_CHARS - postContent.value.length);
const hasImages = computed(() => mediaPreviews.value.some(m => m.type === 'image'));
const hasVideo = computed(() => mediaPreviews.value.some(m => m.type === 'video'));
const canPost = computed(() => {
  return (
    postContent.value.trim().length > 0 ||
    mediaPreviews.value.length > 0
  ) && remainingChars.value >= 0;
});
const currentPrivacy = computed(() => {
  return privacyOptions.find(opt => opt.value === privacy.value) || privacyOptions[0];
});
const isUploading = computed(() => {
  return Object.values(uploadProgress.value).some(progress => progress < 100);
});

// Methods
const adjustTextareaHeight = () => {
  if (textAreaRef.value) {
    textAreaRef.value.style.height = 'auto';
    textAreaRef.value.style.height = `${textAreaRef.value.scrollHeight}px`;
  }
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const resetForm = () => {
  postContent.value = '';
  mediaPreviews.value = [];
  uploadProgress.value = {};
  cancelTokens.value = {};
  privacy.value = 'public';
  error.value = null;
  showPrivacyMenu.value = false;
  showEmojiPicker.value = false;
};

const togglePrivacyMenu = () => {
  showPrivacyMenu.value = !showPrivacyMenu.value;
};

const selectPrivacy = (option) => {
  privacy.value = option.value;
  showPrivacyMenu.value = false;
};


const handleImageUpload = (e) => {
  const files = Array.from(e.target.files || []);
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

  e.target.value = '';
};

const handleVideoUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith('video/')) return;

  if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    error.value = `O vídeo deve ter no máximo ${MAX_VIDEO_SIZE_MB}MB`;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const id = uuidv4();
    mediaPreviews.value = [{
      id,
      url: e.target.result,
      type: 'video',
      format: file.type.split('/')[1],
      file
    }];
  };
  reader.readAsDataURL(file);

  e.target.value = '';
};

const removeMedia = (index) => {
  const media = mediaPreviews.value[index];

  if (uploadProgress.value[media.id] !== undefined && cancelTokens.value[media.id]) {
    cancelTokens.value[media.id].cancel('Upload cancelado pelo usuário');
    delete cancelTokens.value[media.id];
  }

  mediaPreviews.value.splice(index, 1);

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
        cancelToken: source.token,
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

    delete cancelTokens.value[media.id];

    if (!response.data) return null;

    const hlsUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_hd/${response.data.public_id}.m3u8`;

    const thumbnailUrl = media.type === 'video' ?
      `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${response.data.width},h_${response.data.height},c_fill,q_auto,f_jpg,so_2/${response.data.public_id}.jpg` :
      null;

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

const getVideoDuration = (url) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => {
      resolve(null);
    };
  });
};

const handleSubmit = async () => {
  if (!canPost.value) return;

  isPosting.value = true;
  error.value = null;

  try {
    const mediaUploads = mediaPreviews.value.map(media => uploadMedia(media));
    const uploadedMedia = (await Promise.all(mediaUploads)).filter(Boolean);
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
      ...(replyTo.value && {
        isReply: true,
        originalPost: replyTo.value._id
      })
    };

    if (postData.content || postData.media.length > 0) {
      await createPost(postData).then(res => {
        resetForm();
        emit('post-created', res.data);
        closeModal();
      });
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao criar post';
  } finally {
    isPosting.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  nextTick(adjustTextareaHeight);
});



</script>

<template>
  <Dialog :open="isOpen" class="relative z-50">
    <div class="fixed inset-0 bg-gray-500/30 backdrop-blur dark:bg-gray-600/90" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
      <DialogPanel
        class="w-full max-w-[95vw] sm:max-w-[600px] max-h-[90vh] transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl transition-all relative flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle as="h3" class="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
            {{ replyTo ? 'Responder' : 'Criar Post' }}
          </DialogTitle>
          <button @click="closeModal"
            class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto flex-1 p-4">
          <!-- Privacy Menu -->
          <div class="relative mb-4" ref="privacyMenuRef">
            <button @click="togglePrivacyMenu"
              class="relative flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-full">
              <span v-html="currentPrivacy.icon" class="absolute left-3 top-1/2 -translate-y-1/2"></span>
              <span class="pl-8">{{ currentPrivacy.label }}</span>
              <svg class="w-4 h-4 transition-transform duration-200 ml-auto" :class="{ 'rotate-180': showPrivacyMenu }"
                fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"></path>
              </svg>
            </button>

            <div v-if="showPrivacyMenu"
              class="absolute z-10 mt-2 w-64 rounded-lg bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 overflow-visible">
              <div class="p-2">
                <div v-for="option in privacyOptions" :key="option.value" @click="selectPrivacy(option)"
                  class="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors relative">
                  <span v-html="option.icon" class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"></span>
                  <div class="pl-8">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ option.label }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ option.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reply header -->
          <div v-if="replyTo" class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Respondendo a @{{ replyTo.author.username }}
            </p>
          </div>

          <!-- Textarea -->
          <textarea maxlength="280" v-model="postContent" ref="textAreaRef" placeholder="O que está acontecendo?"
            class="w-full bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 mb-3"
            :rows="mediaPreviews.length ? 1 : 4" @input="adjustTextareaHeight"></textarea>

          <!-- Media previews -->
          <div v-if="mediaPreviews.length" class="grid grid-cols-2 gap-2 mb-3">
            <div v-for="(media, index) in mediaPreviews" :key="media.id" class="relative rounded-lg overflow-hidden"
              :class="{
                'col-span-2': mediaPreviews.length === 1,
                'h-48': mediaPreviews.length > 1,
                'h-64': mediaPreviews.length === 1,
                'opacity-70': uploadProgress[media.id] !== undefined && media.type === 'image',
                'transition-opacity duration-300': uploadProgress[media.id] !== undefined
              }">
              <img v-if="media.type === 'image'" :src="media.url" class="w-full h-full object-cover" />
              <video v-if="media.type === 'video'" controls class="w-full h-full object-cover">
                <source :src="media.url" :type="'video/' + media.format" />
              </video>
              <button @click.stop="removeMedia(index)"
                class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70">
                <svg viewBox="0 0 24 24" class="w-5 h-5 text-white">
                  <path fill="currentColor"
                    d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                  </path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Upload progress -->
          <div v-if="isUploading" class="flex items-center mb-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div class="relative w-7 h-7 mr-2">
              <svg class="w-full h-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" class="stroke-blue-200 dark:stroke-blue-700"
                  stroke-width="3"></circle>
                <circle cx="18" cy="18" r="16" fill="none" class="stroke-blue-500" stroke-width="3"
                  stroke-dasharray="100" stroke-dashoffset="100" :style="{
                    'stroke-dashoffset': 100 - Math.max(...Object.values(uploadProgress)),
                    'transition': 'stroke-dashoffset 0.3s ease'
                  }"></circle>
              </svg>
              <span
                class="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                {{ Math.max(...Object.values(uploadProgress)) }}
              </span>
            </div>
            <span class="text-sm text-blue-600 dark:text-blue-300">Enviando mídia...</span>
          </div>

          <!-- Error messages -->
          <div v-if="error" class="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative">
            <span class="block text-xs sm:inline">{{ error }}</span>
            <button @click="error = null" class="absolute top-0 bottom-0 right-0 px-3">✕</button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 relative">
          <div class="flex justify-between items-center">
            <div class="flex space-x-1">
              <input type="file" ref="imageInput" accept="image/*" multiple @change="handleImageUpload" class="hidden" />
              <button type="button" @click="imageInput?.click()" :disabled="hasVideo"
                class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
                title="Adicionar imagens">
                <svg fill="none" class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                    d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm2 1v7.213l1.246-.932.044-.03a3 3 0 0 1 3.863.454c1.468 1.58 2.941 2.749 4.847 2.749 1.703 0 2.855-.555 4-1.618V5H5Zm14 10.357c-1.112.697-2.386 1.097-4 1.097-2.81 0-4.796-1.755-6.313-3.388a1 1 0 0 0-1.269-.164L5 14.712V19h14v-3.643ZM15 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z">
                  </path>
                </svg>
              </button>

              <input type="file" ref="videoInput" accept="video/*" @change="handleVideoUpload" class="hidden" />
              <button type="button" @click="videoInput?.click()" :disabled="hasImages"
                class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
                title="Adicionar vídeo">
                <svg fill="none" class="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4Zm2 1v2h2V5H5Zm4 0v6h6V5H9Zm8 0v2h2V5h-2Zm2 4h-2v2h2V9Zm0 4h-2v2h2V13Zm0 4h-2V19h2ZM15 19v-6H9v6h6Zm-8 0v-2H5v2h2Zm-2-4h2v-2H5v2Zm0-4h2V9H5v2Z">
                  </path>
                </svg>
              </button>
            </div>

            <div class="flex items-center space-x-3">
              <span class="text-sm" :class="{
                'text-gray-500': remainingChars >= 0,
                'text-red-500': remainingChars < 0
              }">
                {{ remainingChars }}
              </span>
              <button type="submit" @click="handleSubmit" :disabled="isPosting || !canPost"
                class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <span v-if="isPosting">Postando...</span>
                <span v-else>{{ replyTo ? 'Responder' : 'Postar' }}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<style>
emoji-picker {
  --border-radius: 8px;
  --shadow: none;
  --emoji-size: 1.5rem;
  width: 320px;
  height: 400px;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Textarea focus */
textarea:focus {
  outline: none;
}

/* SVG styling */
svg {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>