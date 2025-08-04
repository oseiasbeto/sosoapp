<template>
    <div>
        <profile-list 
            :users="suggestedUsers?.users || []" 
            :is-replies="false"            
            :loading="loadingGetSuggestedUsers"
            users-module="suggested_users_search" 
            :b-space="55" 
            :loading-load-more="false"
            :pagination="suggestedUsers?.pagination" 
            ref="profileListComponent">

            <template #before-content>
                <div class="pt-2 pb-2 px-4">
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

                    <SearchWrapper />
                    <!--end header-->
                </div>
            </template>
        </profile-list>
    </div>


</template>

<script setup>
import { useRouter } from 'vue-router';
import SearchWrapper from '../components/SearchWrapper.vue';
import { computed, onMounted } from 'vue';
import { useSearch } from '../search.hook';
import { useStore } from 'vuex';
import ProfileList from '@/app/profiles/components/ProfileList.vue';
const { getSuggestedUsers, loading: loadingGetSuggestedUsers } = useSearch();

const router = useRouter()
const store = useStore()

const users = computed(() => store.getters.users);
const suggestedUsers = computed(() => users?.value.find(m => m.byId === 'suggested_users_search'));

onMounted(async () => {
    await getSuggestedUsers({
        tab: 'suggested_users_search',
        page: 1,
        limit: 10
    });
});
</script>