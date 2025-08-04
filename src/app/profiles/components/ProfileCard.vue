<template>
    <div class="p-4 border-y border-light-border dark:border-dark-border">
        <div class="flex">
            <div id="left-part" class="flex flex-col pr-3">
                <Avatar :url="profile?.profile_image?.low || null" alt-text="Foto" />
            </div>
            <div id="right-part" class="min-w-0 flex flex-col items-center flex-1 flex-shrink-0">
                <!--start header-->
                <div ref="parent"
                    class="w-full flex gap-2 items-center min-w-0 max-w-full overflow-hidden flex-shrink-0">
                    <!--start profile details-->
                    <ProfileCardDetails :profile="props?.profile" />
                    <!--end profile details-->

                    <!--start btn follow-->
                    <div class="shrink-0 flex-1">
                        <button @click="handleFollowUser(props?.profile?._id, user._id)" class="py-2 px-3 font-semibold text-[13px] bg-primary text-[#fff] rounded-lg"
                            :class="{ '!bg-light-card dark:!bg-dark-card !text-light-text-secondary dark:!text-dark-text-secondary': isFollowing }">
                            {{ isFollowing ? 'Seguindo' : 'Seguir' }}
                        </button>
                    </div>
                    <!--end btn follow-->
                </div>
                <!--end header-->
            </div>
        </div>
        <!--start bio-->
        <p v-show="profile?.bio?.length > 0"
            class="text-sm mt-3 line-clamp-2 whitespace-pre-wrap text-light-text-primary dark:text-dark-text-primary max-w-full">
            {{ profile?.bio || 'Bio' }}
        </p>
        <!--end bio-->
    </div>
</template>

<script setup>
import Avatar from '@/components/utilities/Avatar.vue';
import ProfileCardDetails from './ProfileCardDetails.vue';
import { useStore } from 'vuex';
import { computed } from 'vue';
import { useProfile } from '../profiles.hook';
const { followUser, loading: loadingFollowUser } = useProfile();


const props = defineProps({
    profile: {
        type: Object,
        required: true
    },
    tab: {
        type: String,
        required: true
    }
});


const store = useStore()
const user = computed(() => store.getters.currentUser)

// Verifica se o usuário atual segue o perfil
const isFollowing = computed(() => {
    if (!user.value?._id || !props?.profile?._id || !user?.value?.following) {
        return false;
    }
    return props.profile?.followers.includes(user.value?._id);
});

const handleFollowUser = async (followingId, followerId) => {
    try {
        await followUser({ followingId, followerId, tab: props.tab });
    } catch (error) {
        console.error('Erro ao seguir/deixar de seguir:', error);
    }
};
</script>