<template>
    <div>
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
                <h1 class="text-lg font-extrabold text-light-text-primary dark:text-dark-text-primary">
                    Explorar
                </h1>
            </div>

            <SearchWrapper />
            <!--end header-->
        </div>

        <!--start body-->
        <div>
            <h1>Body</h1>
        </div>
        <!--end body-->
    </div>


</template>
<script setup>
import { useRouter } from 'vue-router';
import SearchWrapper from '../components/SearchWrapper.vue';
import { onMounted } from 'vue';
import { useSearch } from '../search.hook';

const router = useRouter()
const { getSuggestedUsers, loading: loadingGetSuggestedUsers } = useSearch();


onMounted(async () => {
    await getSuggestedUsers();
});
</script>