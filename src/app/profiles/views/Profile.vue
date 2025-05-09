<template>
    <div>
        <!-- Start details profile -->
        <div>{{ profile?.name || 'Carregando...' }}</div>
        <!-- End details profile -->

        <!-- Start actions profile -->
        <div v-if="profile?._id && user?._id && profile._id !== user._id">
            <button :disabled="loadingFollowUser" @click="handleFollowUser(userId, isFollowedBy && !isFollowing)">
                <span v-if="isFollowing && isFollowedBy">Deixar de seguir</span>
                <span v-else-if="isFollowing">Deixar de seguir</span>
                <span v-else-if="isFollowedBy">Seguir de volta</span>
                <span v-else>+ Seguir</span>
            </button>
        </div>
        <div v-else>
            <router-link :to="'/profile/' + profile._id + '/setup'">
                Editar perfil
            </router-link>
        </div>
        <!-- End actions profile -->
    </div>
</template>

<script setup>
import { useProfile } from '@/hooks/profiles';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const { 
    getUserById, loading: loadingGetById, 
    followUser, loading: loadingFollowUser 
} = useProfile();

const route = useRoute();
const store = useStore();

// Computeds
const userId = computed(() => route.params.user_id);
const profile = computed(() => store.getters.currentProfile);
const user = computed(() => store.getters.currentUser);

// Verifica se o usuário atual segue o perfil
const isFollowing = computed(() => {
    if (!user.value?._id || !profile.value?._id || !user.value.following) {
        return false;
    }
    return user.value.following.includes(profile.value._id);
});

// Verifica se o perfil segue o usuário (substituindo isFollowedBack)
const isFollowedBy = computed(() => {
    if (!user.value?._id || !profile.value?._id || !user.value.followers) {
        return false;
    }
    return user.value.followers.includes(profile.value._id);
});

// Functions
const handleFollowUser = async (userId, isFollowBack = false) => {
    try {
        console.log(userId)
        await followUser({ userIdToFollow: userId, isFollowBack });
    } catch (error) {
        console.error('Erro ao seguir/deixar de seguir:', error);
    }
};

onMounted(async () => {
    if (route.name !== 'My profile') {
        if (!profile.value?._id || profile.value?.userId !== userId.value) {
            await getUserById(userId.value);
        } else {
            loadingGetById.value = false
        }
    } else {
        loadingGetById.value = false
        store.dispatch("setProfile", user?.value)
    }
});
</script>