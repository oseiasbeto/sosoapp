<template>
    <div v-if="!hasSearchQuery">
        <section v-show="tabView === 'home_search'">
            <profile-list :users="suggestedUsers?.users || []" :is-replies="false" :loading="loadingGetSuggestedUsers"
                users-module="suggested_users_search" :b-space="55" :pagination="suggestedUsers?.pagination"
                ref="profileListComponent">

                <template #before-content>
                    <div class="h-24"></div>
                    <div class="pt-2 fixed top-0 z-10 w-full bg-light-bg dark:bg-dark-bg pb-2 px-4">
                        <!--start header-->
                        <div class="flex items-center mb-2 gap-1.5">
                            <button
                                class="text-light-text-secondary flex justify-center items-center w-[34px] h-[34px] dark:text-dark-text-light rounded-full hover:bg-light-card hover:dark:bg-dark-card"
                                @click="router.back()">
                                <svg fill="none" width="24" viewBox="0 0 24 24" height="24">
                                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                                        d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z">
                                    </path>
                                </svg>
                            </button>
                            <h1 class="text-base font-extrabold text-light-text-primary dark:text-dark-text-primary">
                                Explorar
                            </h1>
                        </div>

                        <SearchWrapper @on-press="tabView = 'search_autocomplit'" />
                        <!--end header-->
                    </div>
                </template>
            </profile-list>
        </section>

        <section v-if="tabView === 'search_autocomplit'" class="relative">
            <div class="pt-2 fixed z-10 top-0 w-full bg-light-bg dark:bg-dark-bg flex items-center gap-1 pb-2 px-4">
                <!--start header-->
                <SearchInput @search="onSearch" @input="onInput" />
                <!--end header-->

                <button @click="resetSearch"
                    class="p-3 font-semibold rounded-lg text-light-muted dark:text-dark-text-secondary hover:bg-light-card hover:dark:bg-dark-card">
                    Cancelar
                </button>
            </div>

            <div class="pt-12 pb-14">
                <div v-if="!loadingSearchUsers && usersAutocomplit?.length" class="flex flex-col py-4">
                    <ProfileCard v-for="user in usersAutocomplit" :key="user._id" :profile="user"
                        :tab="'search_users_autocomplit'" :show-bio="false" :show-btn-follow="false" />
                </div>
                <div class="flex justify-center py-6" v-if="loadingSearchUsers">
                    <SpinnerSmall />
                </div>
            </div>
        </section>
    </div>
    <div v-else>
        <p>Resultado da busca</p>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import SearchWrapper from '../components/SearchWrapper.vue';
import { computed, ref, onMounted } from 'vue';
import { useSearch } from '../search.hook';
import { useStore } from 'vuex';
import ProfileList from '@/app/profiles/components/ProfileList.vue';
import SearchInput from '../components/SearchInput.vue';
import ProfileCard from '@/app/profiles/components/ProfileCard.vue';
import SpinnerSmall from '@/components/base/SpinnerSmall.vue';
import { usePost } from '@/app/posts/posts.hook';
const { getSuggestedUsers, loading: loadingGetSuggestedUsers } = useSearch();
const { searchUsers, loading: loadingSearchUsers } = useSearch();
const { serchPosts, loading: loadingSearchPosts } = usePost();

const router = useRouter()
const route = useRoute()
const store = useStore()
const usersAutocomplit = ref([])

const profileListComponent = ref(null);
const tabView = ref('home_search');
const activeTab = ref('posts')

const mainPosts = ref({
    data: [],
    pagination: {}
})

const recentPosts = ref({
    data: [],
    pagination: {}
})

const usersSearch = ref({
    data: [],
    pagination: {}
})

const users = computed(() => store.getters.users);
const suggestedUsers = computed(() => users?.value.find(m => m.byId === 'suggested_users_search'));
const hasSearchQuery = computed(() => !!route.query.q && route.query.q.trim() !== "")

const onSearch = async (query) => {
    if (query.trim()) {
        router.push({ name: 'Search', query: { q: query } });
        await serchPosts({
            tab: 'search_posts',
            page: 1,
            limit: 10,
            searchQuery: query
        }).then(res => {
            const { posts } = res;
            const pagination = res.pagination || {};
        });
    }
};

const resetSearch = () => {
    tabView.value = 'home_search';
    usersAutocomplit.value = [];
}

const onInput = async (query) => {
    if (query.trim()) {
        await searchUsers({
            tab: 'search_users_autocomplit',
            page: 1,
            limit: 10,
            searchQuery: query
        }).then(res => {
            const { users } = res;
            usersAutocomplit.value = users;
        })
    } else {
        usersAutocomplit.value = [];
    }
};
onMounted(async () => {
    if (!suggestedUsers?.value?.users?.length) {
        await getSuggestedUsers({
            tab: 'suggested_users_search',
            page: 1,
            limit: 10
        });
    }

});
</script>