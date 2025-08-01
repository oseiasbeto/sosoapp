<script setup>
import SplashScreen from "./components/base/SplashScreen.vue"
import Sidebar from "./components/base/Sidebar.vue"
import { useStore } from "vuex"
import { computed, onMounted, ref, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import { useAuth } from "./app/auth/auth.hook";
import { getSocket, disconnectSocket } from '@/services/socket';
import DrawerRepost from "./components/drawers/DrawerRepost.vue";
import DrawerPostMoreOptions from "./components/drawers/DrawerPostMoreOptions.vue";

const { refreshToken, loading } = useAuth()

loading.value = true
// Estado para o tema
const isDark = ref(false);

const store = useStore()
const route = useRoute()
const sessionId = Cookies.get("session_id")

const user = computed(() => {
  return store.getters.user
})

const isAuthenticated = computed(() => {
  const accessToken = store.getters.accessToken

  if (accessToken) return true
  else return false
})

const modal = computed(() => {
  return store.getters.modalContent
})

const drawer = computed(() => {
  return store.getters.drawerContent
})

// Fecha o modal
const closeModal = () => {
  store.dispatch("closeModal")
};

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
  if (sessionId && !isAuthenticated.value) {
    await refreshToken(sessionId).then(() => {
      const socket = getSocket();

      if (socket) {
        socket.on('newNotification', (notification) => {
          console.log('Notificação recebida no App.vue:', notification);
          store.dispatch('addNotification', notification);
        });
        return true;
      } else {
        console.log('Nenhum socket encontrado');
        return false;
      }
    })
  } else {
    loading.value = false
  }
})
onUnmounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.off('newNotification');
  }
});
</script>

<template>

  <div class="font-primary w-screen text-sm h-screen text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg">
    <!-- start main app area-->
    <div v-if="!loading">
      <!--start content-->
      <div class="h-full">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['Home', 'Profile', 'Notifications', 'PostDetails']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <!--end content-->

      <!--start sidebar-->
      <sidebar v-show="isAuthenticated && route.meta.rootPage == 'main'" />
      <!--end sidebar-->

      <!--start modals-->
      <!--end modals-->

      <!--start drawers-->
      <drawer-repost />
      <drawer-post-more-options />
      <!--end drawers-->
    </div>
    <div v-else>
      <splash-screen />
    </div>
    <!-- end main app area-->
  </div>

</template>
