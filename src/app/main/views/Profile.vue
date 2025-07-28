<template>
    <div class="relative">
        <!--start posts-->
        <post-list :posts="profilePosts?.posts || []" :is-replies="false" ref="postListComponent"
            @on-scroll="handleScroll" :loading="loadingPosts" :posts-module="`profile_${activeTab}_${profile?._id}`"
            :show-list="!loadingGetById" :b-space="64" :loading-load-more="loadingLoadMore"
            :pagination="profilePosts?.pagination" @load-more="handleLoadingMorePosts">

            <template #before-content>
                <!--start navbar-->
                <Navbar :title="profile?.name ? profile?.name : ''" />
                <!--end navbar-->
                <div v-if="!loadingGetById" class="relative">
                    <!--start background image area-->
                    <div class="w-full mt-14 h-[150px] bg-light-card dark:bg-dark-card relative">
                        <img class="w-full h-full z-[1px] pointer-events-none object-cover absolute top-0 right-0 left-0"
                            v-if="profile?.cover_photo?.url || profile?.cover_photo?.low"
                            v-lazy="profile?.cover_photo.url || profile?.cover_photo?.low">
                    </div>
                    <!--end background image area-->

                    <!--start content area-->
                    <div class="px-4 pb-2 pt-3">
                        <!--start actions area-->
                        <div class="pl-[90px] gap-1 flex flex-row items-center justify-end">
                            <div class="flex flex-row gap-1 items-center"
                                v-if="profile?._id && user?._id && profile?._id !== user?._id">
                                <button
                                    class="flex text-light-text-secondary dark:text-dark-text-light bg-light-card dark:bg-dark-card text-sm font-semibold gap-2 justify-center items-center bg-light-dark rounded-full w-[34px] h-[34px]">
                                    <svg v-if="true" fill="none" width="20" viewBox="0 0 24 24" height="20">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M12 2a1 1 0 0 1 0 2 5.85 5.85 0 0 0-5.802 5.08L5.143 17h13.715l-.382-2.868-.01-.102a1 1 0 0 1 1.973-.262l.02.1.532 4a1 1 0 0 1-.99 1.132h-3.357c-.905 1.747-2.606 3-4.644 3s-3.74-1.253-4.643-3H4a1 1 0 0 1-.991-1.132l1.207-9.053A7.85 7.85 0 0 1 12 2ZM9.78 19c.61.637 1.397 1 2.22 1s1.611-.363 2.22-1H9.78ZM17 2.5a1 1 0 0 1 1 1V6h2.5a1 1 0 0 1 0 2H18v2.5a1 1 0 0 1-2 0V8h-2.5a1 1 0 1 1 0-2H16V3.5a1 1 0 0 1 1-1Z">
                                        </path>
                                    </svg>
                                    <svg v-else fill="none" width="20" viewBox="0 0 24 24" height="20">
                                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M12 2a7.854 7.854 0 0 1 7.784 6.815l1.207 9.053a1 1 0 0 1-.99 1.132h-3.354c-.904 1.748-2.608 3-4.647 3-2.038 0-3.742-1.252-4.646-3H4a1.002 1.002 0 0 1-.991-1.132l1.207-9.053A7.85 7.85 0 0 1 12 2ZM9.78 19c.608.637 1.398 1 2.221 1s1.613-.363 2.222-1H9.779ZM3.193 2.104a1 1 0 0 1 1.53 1.288A9.47 9.47 0 0 0 2.72 7.464a1 1 0 0 1-1.954-.427 11.46 11.46 0 0 1 2.428-4.933Zm16.205-.122a1 1 0 0 1 1.409.122 11.47 11.47 0 0 1 2.429 4.933 1 1 0 0 1-1.954.427 9.47 9.47 0 0 0-2.006-4.072 1 1 0 0 1 .122-1.41Z">
                                        </path>
                                    </svg>
                                </button>
                                <button :disabled="loadingFollowUser"
                                    @click="handleFollowUser(userId, isFollowedBy && !isFollowing)"
                                    class="flex text-sm border bg-primary text-[#fff] border-primary font-semibold gap-2 justify-center items-center bg-light-dark rounded-full h-[34px] px-4"
                                    :class="{ 'border-transparent !text-primary bg-primary/10': isFollowing }">
                                    <p>
                                        <span v-if="isFollowing && isFollowedBy">Deixar de seguir</span>
                                        <span v-else-if="isFollowing">Deixar de seguir</span>
                                        <span v-else-if="isFollowedBy">Seguir de volta</span>
                                        <span v-else>+ Seguir</span>
                                    </p>
                                </button>
                            </div>
                            <div v-else>
                                <router-link :to="'/profile/' + profile._id + '/setup'"
                                    class="flex text-light-text-secondary dark:text-dark-text-light bg-light-card dark:bg-dark-card text-[13px] font-semibold gap-2 justify-center items-center bg-light-dark rounded-full py-[7px] px-3">
                                    <p>Editar perfil</p>
                                </router-link>
                            </div>

                            <button
                                class="flex text-light-text-secondary dark:text-dark-text-light bg-light-card dark:bg-dark-card active:brightness-100 text-sm font-semibold gap-2 justify-center items-center bg-light-dark rounded-full w-[34px] h-[34px]">
                                <svg fill="none" width="16" viewBox="0 0 24 24" height="16">
                                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M2 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm16 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z">
                                    </path>
                                </svg>
                            </button>

                        </div>
                        <!--end actions area-->

                        <!--start content area-->
                        <div class="pt-4 gap-0.5 w-full pb-2">
                            <div
                                class="text-[24px] font-extrabold flex text-light-text-primary dark:text-dark-text-primary flex-wrap items-center gap-1.5 truncate text-lg ">
                                <p class="font-bold whitespace-break-spaces">
                                    {{ profile.name }}
                                </p>
                                <svg fill="none" width="18" viewBox="0 0 24 24" height="18">
                                    <circle cx="12" cy="12" r="11.5" fill="hsl(211, 99%, 56%)"></circle>
                                    <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
                                    </path>
                                </svg>
                            </div>
                            <div
                                class="text-sm text-light-text-secondary dark:text-dark-text-light truncate overflow-hidden break-words text-ellipsis max-w-full text-muted">
                                @{{ profile.username }}
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <router-link class="flex flex-wrap text-base hover:underline leading-3" to="#">
                                <span
                                    class="flex items-center text-[15px] font-medium text-light-text-primary dark:text-dark-text-primary mr-1">{{
                                        130 }}</span>
                                <span class="text-light-text-secondary dark:text-dark-text-light text-sm mt-[0.75px]">{{
                                    2 == 1 ?
                                        'Seguidor' : 'seguidores' }}</span>
                            </router-link>
                            <router-link class="flex flex-wrap text-base hover:underline leading-3" to="#">
                                <span
                                    class="flex items-center text-[15px] font-medium text-light-text-primary dark:text-dark-text-primary mr-1">{{
                                        50 }}</span>
                                <span
                                    class="text-light-text-secondary dark:text-dark-text-light text-sm mt-[0.75px]">seguindo</span>
                            </router-link>
                        </div>
                        <!--start bio-->
                        <p v-show="profile?.bio?.length"
                            class="text-light-text-primary break-words text-sm dark:text-dark-text-primary mt-2 whitespace-pre-wrap"
                            role="paragraph" aria-label="Texto do post">
                            {{ profile?.bio }}
                        </p>
                        <!--end bio-->
                        <!--end content area-->
                    </div>
                    <!--end content area-->

                    <!--start avatar area-->
                    <div class="absolute top-[110px] left-[10px]">
                        <div class="border-[3px] rounded-full border-light-bg dark:border-dark-bg">
                            <avatar :url="profile?.profile_image?.low || undefined" size="big" alt-text="Foto" />
                        </div>
                    </div>
                    <!--end avatar area-->

                    <!--tabs start-->
                    <Tabs ref="tabsComponent" v-model="activeTab" :tabs="tabs" />
                    <!--end start-->
                </div>
                <div v-else>
                    <div class="mt-14">
                        <ProfileSkeleton />
                    </div>

                </div>
            </template>
        </post-list>
        <!--end posts-->

        <!--start footer-->
        <btn-plus v-if="profile?._id && user?._id && profile._id === user._id"
            @on-press="goToPost(`profile_feed_${profile?._id}`)">
            <svg viewBox="0 0 24 24" stroke="#fff" fill="none" width="29" height="29" class="r-jwli3a">
                <path
                    d="M 20 9 L 20 16 C 20 18.209 18.209 20 16 20 L 8 20 C 5.791 20 4 18.209 4 16 L 4 8 C 4 5.791 5.791 4 8 4 L 15 4"
                    stroke-width="1.5"></path>
                <line stroke-linecap="round" x1="10" y1="14" x2="18.5" y2="5.5" stroke-width="2.25"></line>
                <line stroke-linecap="round" x1="20.5" y1="3.5" x2="21" y2="3" stroke-width="2.25"></line>
            </svg>
        </btn-plus>
        <!--end footer-->
    </div>

</template>

<script setup>
import Tabs from '@/components/base/Tabs.vue';
import Avatar from '@/components/utilities/Avatar.vue';
import { useProfile } from '@/hooks/profiles';
import { usePost } from '@/hooks/posts';
import { computed, onMounted, nextTick, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import ProfileSkeleton from '../components/ProfileSkeleton.vue';
import PostList from '@/app/posts/components/PostList.vue';
import BtnPlus from '@/components/btns/BtnPlus.vue';
import Navbar from '@/components/base/Navbar.vue';

const {
    getUserById, loading: loadingGetById,
    followUser, loading: loadingFollowUser
} = useProfile();

const { getProfilePosts, loading: loadingPosts } = usePost()
const { loadMoreProfilePosts, loading: loadingLoadMore } = usePost()

const route = useRoute();
const router = useRouter()
const store = useStore();

const activeTab = ref('feed')

const tabs = ref([
    { label: "Postagens", value: 'feed' },
    { label: "Repostagens", value: 'reposted' },
    { label: "Mídia", value: 'media' },
    { label: "Curtidas", value: 'liked' }
])

const tabIndices = ref({
    feed: null
})

const postListComponent = ref(null)
const tabsComponent = ref(null)
const lastProfileId = ref(null)

// Computeds
const userId = computed(() => route.params.user_id);
const profile = computed(() => store.getters.currentProfile);
const profiles = computed(() => store.getters.profiles);
const user = computed(() => store.getters.currentUser);
const posts = computed(() => store.getters.posts)

// Crie um computed para o profileId que lida com todos os casos
const profileId = computed(() => {
    return profile.value?._id || user.value?._id || route.params.user_id;
});

// Atualize a computed profilePosts para usar o profileId
const profilePosts = computed(() => {
    if (!profileId.value) return null;

    const index = tabIndices.value[activeTab.value];
    return index !== undefined ? posts.value[index] : null;
});

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

const handleLoadingMorePosts = async (nextPage) => {
    try {
        await loadMoreProfilePosts({
            page: nextPage,
            userId: profile?.value?._id,
            limit: 10,
            totalItems: profilePosts.value?.pagination?.total,
            tab: activeTab.value
        });

    } catch (error) {
        console.error('Failed to load more posts:', error);
        // Tratamento de erro adicional pode ser adicionado aqui
    }
}

const setScrollPosition = async (position) => {
    await nextTick(); // Espera a atualização do DOM
    if (postListComponent.value?.setScrollTop) {
        postListComponent.value.setScrollTop(position);
    } else {
        console.error('setScrollTop method not available on postListComponent');
    }
};

const goToPost = (postModule) => {
    router.push({
        path: '/composer',
        query: {
            post_module: postModule
        }
    })
}

// Função para atualizar os índices
const updateTabIndices = () => {
    if (!profileId.value) return;

    tabs.value.forEach(tab => {
        const tabId = `profile_${tab.value}_${profileId.value}`;
        const index = posts.value.findIndex(p => p.byId === tabId);
        tabIndices.value[tab.value] = index !== -1 ? index : null;
    });
};

const handleScroll = (value) => {
    if (posts?.value?.length) {
        const byId = `profile_${activeTab.value}_${profile?.value?._id}`
        store.dispatch("setScrollTopFromPosts", {
            byId,
            value
        })
        store.dispatch("setScrollTopFromProfile", {
            byId: profile?.value?._id,
            scrollTop: value
        })
    } else return
}

watch(() => route.params.user_id, async (newId, oldId) => {
    if (!newId || newId === oldId) return;

    try {
        // Check for cached profile
        const cachedProfile = profiles.value.find(p => p._id === newId) || null;

        if (!cachedProfile) {
            if (profile?.value?._id !== newId) {
                await getUserById(newId);
            } else {
                return;
            }
        } else {
            store.dispatch('setProfile', cachedProfile);
        }

        // Handle posts loading
        loadingPosts.value = true;

        const cachedPosts = profilePosts.value;

        if (!cachedPosts) {
            await getProfilePosts({
                page: 1,
                userId: newId,
                limit: 10,
                tab: activeTab.value
            })
            updateTabIndices();
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    } finally {
        loadingGetById.value = false
        loadingPosts.value = false;
    }
});

watch(() => activeTab.value, async (newTab, oldTab) => {
    if (!newTab || newTab === oldTab) return;

    const byId = `profile_${activeTab.value}_${profile?.value?._id}`

    store.dispatch("setTabFromPosts", {
        byId,
        tab: newTab
    })
    store.dispatch("setScrollTabFromProfile", {
        byId: profile?.value?._id,
        tab: newTab
    })

    const cachedPosts = profilePosts.value;

    if (!cachedPosts) {
        await getProfilePosts({
            page: 1,
            userId: profile?.value?._id,
            limit: 10,
            tab: newTab
        }).then(async () => {
            updateTabIndices();
            await nextTick()
            setScrollPosition(0);
        })
    } else {
        const scrollTop = profilePosts?.value?.scroll_top || 0

        await nextTick()
        setScrollPosition(scrollTop)
    }
})


onMounted(async () => {
    if (route.name !== 'My profile') {
        if (!profile.value?._id || profile.value?._id !== userId.value) {
            const cachedProfile = profiles.value.find(p => p._id === route.params.user_id) || null;

            if (!cachedProfile) {
                await getUserById(userId.value).then(async () => {
                    loadingPosts.value = true
                    lastProfileId.value = profile?.value?._id

                    const cachedPosts = profilePosts.value;

                    if (!cachedPosts) {
                        await getProfilePosts({
                            page: 1,
                            userId: profile?.value?._id,
                            limit: 10,
                            tab: 'feed'
                        })
                        updateTabIndices();
                    } else {
                        loadingPosts.value = false
                    }
                });
            } else {
                store.dispatch('setProfile', cachedProfile)

                if (cachedProfile?._id) {
                    lastProfileId.value = cachedProfile?._id
                    const cachedPosts = profilePosts.value;

                    if (!cachedPosts) {
                        await getProfilePosts({
                            page: 1,
                            userId: cachedProfile?._id,
                            limit: 10,
                            tab: 'feed'
                        })
                        updateTabIndices();
                    }
                }

            }
        } else {
            loadingGetById.value = false

            lastProfileId.value = profile?.value?._id
            const cachedPosts = profilePosts.value

            if (!cachedPosts) {
                await getProfilePosts({
                    page: 1,
                    userId: profile?.value?._id,
                    limit: 10,
                    tab: 'feed'
                })
                updateTabIndices();
            }
        }
    } else {
        loadingGetById.value = false
        store.dispatch("setProfile", user?.value)
        const cachedPosts = profilePosts.value

        if (!cachedPosts) {
            await getProfilePosts({
                page: 1,
                userId: user?.value?._id,
                limit: 10,
                tab: 'feed'
            })
            updateTabIndices();
        }
    }
});
</script>