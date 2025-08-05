<template>
    <div class="relative w-screen overflow-y-auto box-border flex flex-col">

        <!--start header-->
        <div class="flex fixed top-0 w-full z-[100] h-14 p-2 bg-light-bg dark:bg-dark-bg items-center justify-between">
            <button
                class="py-1.5 px-2.5 text-sm hover:bg-primary/20 dark:hover:bg-primary/30 text-light-link dark:text-dark-link rounded-full font-semibold flex items-center"
                @click="openCancelModal">Cancelar</button>
            <button
                class="py-1.5 px-3 text-sm rounded-full text-light-bg disabled:text-light-bg/80 disabled:opacity-80 disabled:pointer-events-none font-semibold bg-primary"
                @click="handleSubmit" :disabled="!canPost || loadingCreatePost || selectFileLoading || isUploading">
                {{ loadingCreatePost ? `${replyTo ? 'Respondendo...' : 'Postando'}` : `${replyTo ? 'Responder' :
                    'Postar'}` }}
            </button>
        </div>
        <!--end header-->

        <!--start body-->
        <div class="flex-1 max-h-full justify-between flex-col mt-14 ">
            <div>
                <!--start error alert-->
                <div v-if="error" class="px-4 mb-5">
                    <div
                        class="py-3 flex justify-between px-3 bg-light-card dark:bg-dark-card mb-2 rounded-lg text-light-text-secondary dark:text-dark-text-primary relative">
                        <div class="flex">
                            <svg class="shrink-0 mr-2" fill="none" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="hsl(346, 91%, 47.2%)" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm8-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-4a1 1 0 0 1-1-1Zm1-3a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z">
                                </path>
                            </svg>
                            <span class="block leading-5">{{ error }}</span>
                        </div>
                        <button @click="error = null"
                            class="shrink-0 w-[22px] h-[22px] rounded-full flex justify-center items-center bg-light-bg dark:bg-dark-bg top-0 bottom-0 right-0">
                            <svg fill="none" width="12" viewBox="0 0 24 24" height="12"
                                style="color: rgb(147, 165, 183); pointer-events: none;">
                                <path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 0 1 1.414 0L12 10.586l6.293-6.293a1 1 0 1 1 1.414 1.414L13.414 12l6.293 6.293a1 1 0 0 1-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L10.586 12 4.293 5.707a1 1 0 0 1 0-1.414Z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
                <!--end error alert-->

                <!--star quill editor -->
                <label for="quillText">
                    <!--start reply to-->
                    <reply-to-original-post
                        :original-post="originalPost.is_repost ? originalPost.original_post : originalPost"
                        v-if="!loadingGetPostById && replyTo && originalPost?._id" />
                    <!--end reply to-->

                    <div class="px-4 flex flex-row">
                        <div>
                            <Avatar :url="user?.profile_image?.low" />
                        </div>
                        <div class="flex-1">
                            <textarea id="quillText" maxlength="280" v-model="postContent" ref="textAreaRef"
                                :placeholder="replyTo ? 'Escrever a resposta...' : 'Mekie?'"
                                class="w-full placeholder:text-light-text-secondary placeholder:dark:text-dark-text-light text-base ml-2 p-1.5 bg-light-bg dark:bg-dark-bg leading-5 text-light-text-primary dark:text-dark-text-primary resize-none outline-none text-white placeholder-gray-500 mb-3"
                                @input="adjustTextareaHeight">
                            </textarea>
                        </div>
                    </div>
                </label>
                <!--end quill editor-->

                <!-- start media previews -->
                <div class="px-4 py-2 pt-0 flex-1 flex flex-row gap-3"
                    :class="{ 'overflow-x-auto': mediaPreviews.length > 1, 'justify-center': mediaPreviews.length === 1 }"
                    v-if="mediaPreviews.length" ref="mediaContainer">
                    <div v-for="(media, index) in mediaPreviews" :key="media.id"
                        class="relative rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border overflow-hidden shadow-sm flex-shrink-0"
                        :class="{
                            'w-48 h-48': mediaPreviews.length > 1, // Quadrado para múltiplas mídias
                            'w-full h-60': mediaPreviews.length === 1 && media.type === 'image', // 100% da largura do pai para uma única imagem
                            'max-w-full min-w-full h-60': mediaPreviews.length === 1 && media.type === 'video', // Máximo de 320px para um único vídeo
                            'opacity-75': uploadProgress[media.id] !== undefined,
                            'transition-opacity duration-300': uploadProgress[media.id] !== undefined
                        }">
                        <!-- Imagem -->
                        <img v-if="media.type === 'image'" :src="media.url" class="w-full h-full object-cover"
                            alt="Prévia da imagem" />

                        <!-- Vídeo -->
                        <video v-if="media.type === 'video'" controls class="w-full h-full object-cover" autoplay loop
                            muted playsinline disablePictureInPicture>
                            <source :src="media.url" :type="'video/' + media.format" />
                        </video>

                        <!-- Botão de remoção (apenas durante o upload) -->
                        <button :disabled="uploadProgress[media.id] === 100" @click.stop="removeMedia(index)"
                            class="absolute top-2 right-2 bg-[#000]/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors duration-200">
                            <svg viewBox="0 0 24 24" class="w-5 h-5">
                                <path fill="currentColor"
                                    d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
                <!-- end media previews -->
            </div>
        </div>
        <!--end body-->

        <!--start footer-->
        <div class="border-t fixed bottom-0 w-full border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg p-2"
            :style="{ transform: footerTransform }">
            <!-- Adicione aqui os controles do footer (emoji, mídia, etc) -->
            <div class="flex items-center justify-between">
                <!-- Exemplo de controles -->
                <div class="flex-1">
                    <div v-if="!isUploading" class="flex items-center">
                        <button
                            class="flex hover:bg-primary/20 dark:hover:bg-primary/25 items-center justify-center w-[39px] h-[39px] rounded-full text-primary disabled:pointer-events-none disabled:text-[#8c9eb2] disabled:dark:text-[#5b7795]"
                            @click="imageInput?.click()" :disabled="hasVideo || selectFileLoading">
                            <input type="file" ref="imageInput" accept="image/*" multiple @change="handleImageUpload"
                                class="hidden" />
                            <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm2 1v7.213l1.246-.932.044-.03a3 3 0 0 1 3.863.454c1.468 1.58 2.941 2.749 4.847 2.749 1.703 0 2.855-.555 4-1.618V5H5Zm14 10.357c-1.112.697-2.386 1.097-4 1.097-2.81 0-4.796-1.755-6.313-3.388a1 1 0 0 0-1.269-.164L5 14.712V19h14v-3.643ZM15 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z">
                                </path>
                            </svg>
                        </button>

                        <button @click="videoInput?.click()" :disabled="hasImages || selectFileLoading || hasUploadedVideo"
                            class="flex hover:bg-primary/20 dark:hover:bg-primary/25 items-center justify-center w-[39px] h-[39px] rounded-full text-primary disabled:pointer-events-none disabled:text-[#8c9eb2] disabled:dark:text-[#5b7795]">
                            <input type="file" ref="videoInput" accept="video/*" @change="handleVideoUpload"
                                class="hidden" />
                            <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4Zm2 1v2h2V5H5Zm4 0v6h6V5H9Zm8 0v2h2V5h-2Zm2 4h-2v2h2V9Zm0 4h-2v2h2V13Zm0 4h-2V19h2ZM15 19v-6H9v6h6Zm-8 0v-2H5v2h2Zm-2-4h2v-2H5v2Zm0-4h2V9H5v2Z">
                                </path>
                            </svg>
                        </button>
                    </div>
                    <div v-else class="flex w-full gap-3 overflow-hidden items-center">
                        <svg width="30" height="30" fill="none">
                            <!-- Círculo de fundo -->
                            <path d="M15 0.5
           a14.5 14.5 0 0 1 0 29
           a14.5 14.5 0 0 1 0 -29" stroke-linecap="butt" stroke-width="1"
                                class="text-[hsl(211,20%,85.89999999999999%)] dark:text-[hsl(211,28%,25.2%)]"
                                stroke="currentColor" />
                            <!-- Círculo de progresso -->
                            <path :stroke-dasharray="dashArrayUploadProgress" d="M15 2.5
           a12.5 12.5 0 0 1 0 25
           a12.5 12.5 0 0 1 0 -25" stroke-linecap="butt" stroke-width="3" stroke="hsl(211, 99%, 56%)" />
                        </svg>
                        <p
                            class="text-sm truncate flex-1 text-ellipsis text-light-text-primary dark:text-dark-text-primary font-medium">
                            {{ hasVideo ? 'Enviando o vídeo...' : 'Enviando imagens...' }}</p>
                    </div>
                </div>

                <div class="flex shrink-0 items-center gap-3">
                    <p class="text-sm font-normal text-light-text-primary dark:text-dark-text-primary">
                        {{ remainingChars }}
                    </p>

                    <svg width="30" height="30" fill="none">
                        <!-- Círculo de fundo -->
                        <path d="M15 0.5
           a14.5 14.5 0 0 1 0 29
           a14.5 14.5 0 0 1 0 -29" stroke-linecap="butt" stroke-width="1"
                            class="text-[hsl(211,20%,85.89999999999999%)] dark:text-[hsl(211,28%,25.2%)]"
                            stroke="currentColor" />
                        <!-- Círculo de progresso -->
                        <path :stroke-dasharray="dashArray" d="M15 2.5
           a12.5 12.5 0 0 1 0 25
           a12.5 12.5 0 0 1 0 -25" stroke-linecap="butt" stroke-width="3" stroke="hsl(211, 99%, 56%)" />
                    </svg>
                </div>
            </div>
        </div>
        <!--end footer-->

        <!-- Modal de Confirmação -->
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div class="bg-light-bg dark:bg-dark-bg rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 class="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Deseja cancelar o post?
                </h3>
                <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                    Todo o conteúdo e mídias não salvas serão perdidos.
                </p>
                <div class="flex justify-end gap-3">
                    <button
                        class="py-2 px-4 text-sm rounded-full text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                        @click="showModal = false">
                        Continuar editando
                    </button>
                    <button class="py-2 px-4 text-sm rounded-full text-light-bg bg-primary hover:bg-primary/80"
                        @click="confirmCancel">
                        Cancelar post
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { usePost } from "@/app/posts/posts.hook";
import axios from 'axios';
import { useStore } from 'vuex';
import ReplyToOriginalPost from '../components/ReplyToOriginalPost.vue';
import CryptoJS from 'crypto-js';
import Avatar from '@/components/utilities/Avatar.vue';

// Constantes do Cloudinary
const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';
const API_KEY = '686559434489718'; // Substitua pelo sua API Key do Cloudinary
const API_SECRET = 'oAYl12OIZf2HkieFNDQQk2romHM'; // Substitua pelo seu API Secret do Cloudinary

const { createPost, loading: loadingCreatePost } = usePost();
const { getPostById, loading: loadingGetPostById } = usePost();

const router = useRouter();
const route = useRoute();
const store = useStore();

const textAreaRef = ref(null);
const mediaContainer = ref(null);
const selectFileLoading = ref(false);
const postContent = ref('');
const mediaPreviews = ref([]);
const uploadProgress = ref({});
const privacy = ref("public");
const cancelTokens = ref({});
const error = ref(null);
const showModal = ref(false);
const uploadedMediaIds = ref([]); // Rastreia public_ids das mídias carregadas

const imageInput = ref(null);
const videoInput = ref(null);
const isKeyboardOpen = ref(false);
const viewportHeight = ref(window.visualViewport.height);

// Constants
const MAX_CHARS = 280;
const MAX_IMAGES = 4;
const MAX_VIDEO_SIZE_MB = 50;

const remainingChars = computed(() => MAX_CHARS - postContent.value.length);
const replyTo = computed(() => route.query.replyto || null);
const postModule = computed(() => route.query.post_module || null);
const originalRepost = computed(() => route.query.original_repost || null);
const originalRepostId = computed(() => route.query.original_repost_id || null);
const shouldAddReply = computed(() => route.query.should_add_reply_from_replies || false);
const addReplyFrom = computed(() => route.query.add_reply_from || null);
const hasImages = computed(() => mediaPreviews.value.some(m => m.type === 'image'));
const hasVideo = computed(() => mediaPreviews.value.some(m => m.type === 'video'));
const isUploading = computed(() => {
    return Object.values(uploadProgress.value).some(progress => progress < 100);
});

const hasUploadedVideo = computed(() => {
    return mediaPreviews.value.some(media => media.type === 'video' && media.public_id);
});

const canPost = computed(() => {
    return (
        postContent.value.trim().length > 0 ||
        mediaPreviews.value.length > 0
    ) && remainingChars.value >= 0;
});
const user = computed(() => store.getters.currentUser);
const originalPost = computed(() => store.getters.originalPost);

const progressChars = computed(() => {
    const percentage = ((MAX_CHARS - remainingChars.value) / MAX_CHARS) * 100;
    return Math.min(Math.max(percentage, 0), 100);
});

const dashArray = computed(() => {
    const circumference = 2 * Math.PI * 12.5;
    const dash = (progressChars.value / 100) * circumference;
    return `${dash} ${circumference - dash}`;
});

const uploadProgressPercentage = computed(() => {
    const progresses = Object.values(uploadProgress.value);
    if (progresses.length === 0) return 0;
    const totalProgress = progresses.reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / progresses.length);
});

const dashArrayUploadProgress = computed(() => {
    const circumference = 2 * Math.PI * 12.5;
    if (isUploading.value) {
        const dash = (uploadProgressPercentage.value / 100) * circumference;
        return `${dash} ${circumference - dash}`;
    } else {
        const percentage = ((MAX_CHARS - remainingChars.value) / MAX_CHARS) * 100;
        const dash = (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;
        return `${dash} ${circumference - dash}`;
    }
});

const footerTransform = computed(() =>
    isKeyboardOpen.value ? `translateY(-${window.innerHeight - window.visualViewport.height}px)` : ''
);

const resetForm = () => {
    postContent.value = '';
    mediaPreviews.value = [];
    uploadProgress.value = {};
    cancelTokens.value = {};
    uploadedMediaIds.value = [];
    privacy.value = 'public';
    error.value = null;
};

const validateVideoIntegrity = (file) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
            if (video.duration === Infinity || isNaN(video.duration) || video.videoWidth === 0) {
                URL.revokeObjectURL(video.src);
                reject(new Error('Vídeo corrompido ou inválido.'));
            } else {
                URL.revokeObjectURL(video.src);
                resolve(true);
            }
        };
        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject(new Error('Vídeo corrompido ou não pôde ser lido.'));
        };
    });
};

const deleteMediaFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signatureString = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
        const signature = CryptoJS.SHA1(signatureString).toString(); // Usar crypto-js para SHA-1

        await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
            {
                public_id: publicId,
                api_key: API_KEY,
                timestamp: timestamp,
                signature: signature,
            }
        );
        uploadedMediaIds.value = uploadedMediaIds.value.filter(id => id !== publicId);
    } catch (error) {
        console.error('Erro ao excluir mídia do Cloudinary:', error);
    }
};

const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const availableSlots = MAX_IMAGES - mediaPreviews.value.length;

    if (files.length > availableSlots) {
        error.value = `Você pode adicionar no máximo ${MAX_IMAGES} imagens`;
        return;
    }

    error.value = null;
    selectFileLoading.value = true;

    for (const file of files.slice(0, availableSlots)) {
        if (!(file instanceof File) || !file.type.startsWith('image/')) {
            error.value = 'Arquivo inválido ou não é uma imagem.';
            continue;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const id = uuidv4();
            const media = {
                id,
                url: e.target.result,
                type: 'image',
                format: file.type.split('/')[1],
                file
            };
            mediaPreviews.value.push(media);
            uploadProgress.value[id] = 0;

            try {
                const uploadedMedia = await uploadMedia(media);
                if (uploadedMedia) {
                    const mediaIndex = mediaPreviews.value.findIndex(m => m.id === id);
                    if (mediaIndex !== -1) {
                        mediaPreviews.value[mediaIndex] = {
                            ...mediaPreviews.value[mediaIndex],
                            ...uploadedMedia
                        };
                        console.log('Mídia atualizada em mediaPreviews:', mediaPreviews.value[mediaIndex]);
                    }
                }
            } catch (err) {
                error.value = err.message || 'Erro ao fazer upload da imagem. Tente novamente.';
                mediaPreviews.value = mediaPreviews.value.filter(m => m.id !== id);
                console.error('Erro no upload da imagem:', err);
            }

            if (mediaPreviews.value.length === files.length + (mediaPreviews.value.length - files.length)) {
                selectFileLoading.value = false;
            }
        };
        reader.onerror = () => {
            error.value = 'Erro ao carregar a imagem. Tente novamente.';
            selectFileLoading.value = false;
        };
        reader.readAsDataURL(file);
    }

    e.target.value = '';
};

const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];

    if (!file || !(file instanceof File) || !file.type.startsWith('video/')) {
        error.value = 'Arquivo inválido ou não é um vídeo.';
        return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        error.value = `O vídeo deve ter no máximo ${MAX_VIDEO_SIZE_MB}MB.`;
        return;
    }
    if (!allowedVideoTypes.includes(file.type)) {
        error.value = 'Formato de vídeo não suportado. Use MP4 ou WebM.';
        return;
    }

    error.value = null;
    selectFileLoading.value = true;

    try {
        await validateVideoIntegrity(file);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const id = uuidv4();
            const media = {
                id,
                url: e.target.result,
                type: 'video',
                format: file.type.split('/')[1],
                file
            };

            mediaPreviews.value = [media];
            uploadProgress.value[id] = 0;

            try {
                const uploadedMedia = await uploadMedia(media);
                if (uploadedMedia) {
                    mediaPreviews.value[0] = {
                        ...mediaPreviews.value[0],
                        ...uploadedMedia
                    };
                }
            } catch (err) {
                error.value = err.message || 'Erro ao fazer upload do vídeo. Tente novamente.';
                mediaPreviews.value = [];
                console.error('Erro no upload do vídeo:', err);
            }

            selectFileLoading.value = false;
        };
        reader.onerror = () => {
            error.value = 'Erro ao carregar o vídeo. Tente novamente.';
            selectFileLoading.value = false;
        };
        reader.readAsDataURL(file);

        e.target.value = '';
    } catch (err) {
        error.value = err.message || 'Vídeo corrompido ou inválido.';
        selectFileLoading.value = false;
    }
};

const removeMedia = async (index) => {
    const media = mediaPreviews.value[index];

    if (uploadProgress.value[media.id] !== undefined && cancelTokens.value[media.id]) {
        cancelTokens.value[media.id].cancel('Upload cancelado pelo usuário');
        delete cancelTokens.value[media.id];
    }

    mediaPreviews.value.splice(index, 1);

    const newProgress = { ...uploadProgress.value };
    delete newProgress[media.id];
    uploadProgress.value = newProgress;

    await nextTick();
    if (mediaContainer.value) {
        mediaContainer.value.scrollTo({ left: 0, behavior: 'smooth' });
    }

    // Excluir do Cloudinary se já foi carregado
    if (media.public_id) {
        await deleteMediaFromCloudinary(media.public_id, media.type);
    }
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

        if (!response.data) {
            const newProgress = { ...uploadProgress.value };
            delete newProgress[media.id];
            uploadProgress.value = newProgress;
            error.value = 'Erro ao carregar mídia'
            return null;
        }

        const hlsUrl = media.type === 'video' ?
            `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_hd/${response.data.public_id}.m3u8` :
            null;

        const thumbnailUrl = media.type === 'video' ?
            `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${response.data.width},h_${response.data.height},c_fill,q_auto,f_jpg,so_2/${response.data.public_id}.jpg` :
            null;

        // Armazenar o public_id para possível exclusão
        media.public_id = response.data.public_id;
        uploadedMediaIds.value.push(response.data.public_id);

        const newProgress = { ...uploadProgress.value };
        delete newProgress[media.id];
        uploadProgress.value = newProgress;

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
    } catch (err) {
        if (axios.isCancel(err)) {
            const newProgress = { ...uploadProgress.value };
            delete newProgress[media.id];
            uploadProgress.value = newProgress;
            return null;
        } else {
            const newProgress = { ...uploadProgress.value };
            delete newProgress[media.id];
            uploadProgress.value = newProgress;
            error.value = 'Erro ao carregar mídia'
            throw err;
        }

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

const adjustTextareaHeight = async () => {
    await nextTick();
    textAreaRef.value.style.height = 'auto';
    const newHeight = textAreaRef.value.scrollHeight;
    const minHeight = 50;
    const maxHeight = 200;
    textAreaRef.value.style.height = `${Math.min(Math.max(newHeight, minHeight), maxHeight)}px`;
    if (isKeyboardOpen.value) {
        textAreaRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

const openCancelModal = () => {
    if (postContent.value.trim().length > 0 || mediaPreviews.value.length > 0) {
        showModal.value = true;
    } else {
        confirmCancel();
    }
};

const confirmCancel = async () => {
    // Cancelar todos os uploads em andamento
    Object.values(cancelTokens.value).forEach(token => token.cancel('Upload cancelado pelo usuário'));
    cancelTokens.value = {};

    // Iniciar exclusão de mídias em background
    const mediaIdsToDelete = [...uploadedMediaIds.value]; // Copiar IDs para evitar alterações concorrentes
    if (mediaIdsToDelete.length > 0) {
        Promise.all(
            mediaIdsToDelete.map(id =>
                deleteMediaFromCloudinary(id, id.includes('video_') ? 'video' : 'image')
                    .catch(err => {
                        console.error(`Erro ao excluir mídia ${id} do Cloudinary:`, err.message, err.response?.data);
                        // Não definimos error.value para evitar impacto na UI
                    })
            )
        ).catch(err => {
            console.error('Erro geral na exclusão em background:', err);
        });
    }

    // Resetar formulário e navegar imediatamente
    resetForm();
    showModal.value = false;
    router.back();
};

const handleSubmit = async () => {
    if (!canPost.value || isUploading.value) return;
    
   // Usar diretamente as mídias válidas em mediaPreviews (já carregadas)
    const validMedia = mediaPreviews.value.filter(media => media.public_id);

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
        shouldAddReply: Boolean(shouldAddReply.value),
        originalRepost: originalPost.value?.original_post?._id,
        isRepost: originalPost.value?.is_repost,
        byRepostId: originalRepost.value ?? undefined,
        originalRepostId: originalRepostId.value ?? undefined,
        addReplyFrom: addReplyFrom.value,
        postModule: postModule.value,
        ...(originalPost.value?._id && replyTo.value && {
            isReply: true,
            originalPost: originalPost.value._id
        })
    };

    if (postData.content || postData.media.length > 0) {
        try {
            await createPost(postData);
            resetForm();
            router.back();
        } catch (error) {
            resetForm();
            router.back();
            console.log(error);
        }
    }
};

// Impedir saída da rota se houver conteúdo ou mídias
onBeforeRouteLeave((to, from, next) => {
    if (canPost.value && !showModal.value) {
        showModal.value = true;
        next(false); // Impede a navegação até o usuário confirmar
    } else {
        next();
    }
});

onMounted(async () => {
    textAreaRef.value.focus();
    if (!originalPost.value?._id && route?.query?.replyto) {
        await getPostById(route?.query?.replyto);
    }
    adjustTextareaHeight();
});

</script>