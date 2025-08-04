<template>
  <div v-if="profile !== null" class="flex items-center min-w-0 w-full">
    <div class="w-full mt-0.5">
      <div class="flex items-baseline text-sm min-w-0 max-w-full overflow-hidden">
        <span @click.stop @click="goToProfile(props.profile)"
          class="font-semibold text-light-text-primary dark:text-dark-text-primary truncate text-ellipsis">
          {{ profile?.name || 'Nome' }}
        </span>
        <div v-if="profile?.verified" class="flex flex-initial"
          style="padding-left: 4px; align-self: center; margin-top: -1px;">
          <svg fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="hsl(211, 99%, 56%)"></circle>
            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
            </path>
          </svg>
        </div>
      </div>
      <div class="flex items-baseline text-sm min-w-0 max-w-full overflow-hidden">
        <span class="flex text-light-text-secondary dark:text-dark-text-light items-baseline min-w-0 overflow-hidden">
          <span @click.stop @click="goToProfile(props.author)" class="text-gray-500 truncate text-ellipsis">
            @{{ profile?.username }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const props = defineProps({
  profile: {
    type: Object,
    default: null
  }
});

const store = useStore()
const router = useRouter()
const route = useRoute()


const goToProfile = (author) => {
  store.dispatch("addNewProfileFromProfiles", author)

  if (route?.params?.user_id !== author?._id) {
    router.push(`/profile/${author?._id}`)
  }
}
</script>

<style scoped></style>