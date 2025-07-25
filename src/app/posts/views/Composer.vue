<template>
    <!--start header-->
    <div class="flex items-center justify-between">
        <div>
            <button @click="router.back()">Voltar</button>
        </div>
        <div>
            <button @click="handleSubmit" :disabled="!canPost">
                {{ loadingCreatePost ? 'Postando...' : 'Postar' }}
            </button>
        </div>
    </div>
    <!--end header-->


    <!--start body-->
    <label for="quillText">
        <!--start reply to-->
        <reply-to-original-post :original-post="originalPost.is_repost ? originalPost.original_post : originalPost"
            v-if="!loadingGetPostById && replyTo && originalPost?._id" />
        <!--end reply to-->

        <textarea id="quillText" maxlength="280" v-model="postContent" ref="textAreaRef"
            :placeholder="replyTo ? 'Escrever a resposta...' : 'O que está acontecendo?'"
            class="w-full bg-transparent resize-none outline-none text-white placeholder-gray-500 mb-3"
            @input="adjustTextareaHeight">
        </textarea>

        <div>
              <button 
      @click="openPrivacyDialog"
      class="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Configurar privacidade
    </button>

    <PrivacyDialog
      :isOpen="isPrivacyDialogOpen"
      :initialPrivacy="postPrivacy"
      :initialAllowComments="allowComments"
      @close="handleClose"
      @save="handleSave"
    />
        </div>
    </label>
    <!--end body-->

    <!--start footer-->
    <!--end footer-->
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { usePost } from "@/hooks/posts";
import { useStore } from 'vuex';
import ReplyToOriginalPost from '../components/ReplyToOriginalPost.vue';
import PrivacyDialog from '../components/PrivacyDialog.vue'
const { createPost, loading: loadingCreatePost } = usePost();
const { getPostById, loading: loadingGetPostById } = usePost();

const router = useRouter()
const route = useRoute()
const store = useStore()

const isPrivacyDialogOpen = ref(false)
const postPrivacy = ref('public')
const allowComments = ref(true)
const textAreaRef = ref(null);
const postContent = ref('');
const mediaPreviews = ref([]);
const uploadProgress = ref({});
const privacy = ref("public");
const cancelTokens = ref({});
const error = ref(null);

// Constants
const MAX_CHARS = 280;
const MAX_IMAGES = 4;
const MAX_VIDEO_SIZE_MB = 50;
const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';

const remainingChars = computed(() => MAX_CHARS - postContent.value.length);
const replyTo = computed(() => route.query.replyto || null);
const postModule = computed(() => route.query.post_module || null);
const originalRepost = computed(() => route.query.original_repost || null);
const originalRepostId = computed(() => route.query.original_repost_id || null);
//const isRepost = computed(() => route.query.is_repost || null);
const shouldAddReply = computed(() => route.query.should_add_reply_from_replies || false);
const addReplyFrom = computed(() => route.query.add_reply_from || null);
const canPost = computed(() => {
    return (
        postContent.value.trim().length > 0 ||
        mediaPreviews.value.length > 0
    ) && remainingChars.value >= 0;
});
const user = computed(() => store.getters.currentUser)
const originalPost = computed(() => {
    return store.getters.originalPost
})

const resetForm = () => {
    postContent.value = '';
    mediaPreviews.value = [];
    uploadProgress.value = {};
    cancelTokens.value = {};
    privacy.value = 'public';
    error.value = null
};

const openPrivacyDialog = () => {
  isPrivacyDialogOpen.value = true
}

const handleClose = () => {
  isPrivacyDialogOpen.value = false
}

const handleSave = (settings) => {
  postPrivacy.value = settings.privacy
  allowComments.value = settings.allowComments
  isPrivacyDialogOpen.value = false
  // Aqui você pode adicionar lógica para salvar no backend
}

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

const adjustTextareaHeight = () => {
    if (textAreaRef.value) {
        textAreaRef.value.style.height = 'auto';
        textAreaRef.value.style.height = `${textAreaRef.value.scrollHeight}px`;
    }
};

const handleSubmit = async () => {
    if (!canPost.value) return;
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
        await createPost(postData).then(() => {
            resetForm();
            router.back()
        }).catch(err => {
            error.value = err.response?.data?.message || 'Erro ao criar post';
        });
    }
}

onMounted(async () => {
    textAreaRef.value.focus()

    if (!originalPost.value?._id && route?.query?.replyto) {
        await getPostById(route?.query?.replyto)
    }
})
</script>
