<script setup>
import { useAuth } from "@/hooks/auth";
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import ModalRegisterUser from "@/components/modals/ModalRegisterUser.vue";
import ModalAuthUser from "@/components/modals/ModalAuthUser.vue";
import ModalRecoverPassword from "@/components/modals/ModalRecoverPassword.vue";

const { googleAuth, loading: loadingGoogleAuth } = useAuth()
const { facebookAuth, loading: loadingFacebookAuth } = useAuth()

const router = useRouter();
const store = useStore()

const modal = computed(() => {
    return store.getters.modalContent
})

const loginWithFacebook = () => {
    loadingFacebookAuth.value = true
    if (!window.FB) {
        loadingFacebookAuth.value = false
        console.error("Facebook SDK não carregado.");
        return;
    }

    window.FB.login(
        (response) => {
            if (response.authResponse) {
                loadingFacebookAuth.value = true
                getUserInfo();
            } else {
                loadingFacebookAuth  .value = false
                console.log("Usuário cancelou o login ou não autorizou.");
            }
        },
        { scope: "public_profile,email" }
    );
};

const getUserInfo = () => {
    window.FB.api("/me", { fields: "id,name,email,picture.width(500).height(500)" }, async (response) => {
        await facebookAuth({
            facebook_id: response?.id,
            name: response?.name,
            email: response?.email,
            picture: response?.picture?.data.url,
        }).then(() => {
            router.replace('/home')
        })
    });
};

const openModal = (name, data) => {
    store.dispatch("openModal", {
        show: true,
        name,
        data
    })
}
const closeModal = () => {
    store.dispatch("openModal", {
        show: false,
        name: "",
        data: {}
    })
}

let googleInstance; // Variável para armazenar a instância do Google Auth

const signInWithGoogle = () => {
    googleInstance = window.google.accounts.oauth2.initTokenClient({
        client_id: '914842748542-mc9j2ltt0no88mqlu144u1q1hu19lhq1.apps.googleusercontent.com',
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                await googleAuth(tokenResponse.access_token).then(() => {
                    router.replace("/home")
                })
            } else {
                console.error('Falha ao obter access token');
            }
        },
        error_callback: (error) => {
            console.error('Erro no login:', error);
        }
    });
    googleInstance.requestAccessToken();
};

onMounted(() => {
    // Carrega a biblioteca do Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
});

</script>

<template>
    <div class="flex min-h-screen items-center justify-center">
        <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
            <h2 class="text-2xl font-semibold text-center text-gray-700">Login</h2>
            <p class="text-gray-500 text-center mt-2">Entre com sua conta</p>

            <div class="mt-6"> 
                <button @click="openModal('login-user')"
                    class="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
                    Entrar
                </button>
            </div>

            <div class="mt-6 flex items-center justify-center space-x-4">
                <button :disabled="loadingGoogleAuth" @click="signInWithGoogle"
                    class="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    <svg class="w-5 h-5 mr-2" viewBox="0 0 48 48">
                        <path fill="#4285F4"
                            d="M24 9.5c3.5 0 6.6 1.2 9 3.3l6.8-6.8C34.9 2 29.8 0 24 0 14.6 0 6.5 5.5 2.2 13.6l7.9 6.2C12.3 12.7 17.6 9.5 24 9.5z" />
                        <path fill="#34A853"
                            d="M46.2 24.5c0-1.6-.1-3.1-.4-4.5H24v9.1h12.7c-.8 3.9-2.9 7.2-6 9.4l7.9 6.2c4.6-4.3 7.6-10.6 7.6-18.2z" />
                        <path fill="#FBBC05"
                            d="M10.1 28.8c-1.5-1.5-2.8-3.3-3.7-5.3l-7.9 6.2c2.9 5.9 8.1 10.6 14.5 12.9l6.3-7.9c-3.4-1.5-6.4-4-8.3-7z" />
                        <path fill="#EA4335"
                            d="M24 48c6.5 0 12.2-2.2 16.3-6l-7.9-6.2c-2.3 1.5-5.2 2.5-8.3 2.5-6.5 0-12-4.3-14-10.1l-7.9 6.2C7.8 42.5 15.4 48 24 48z" />
                    </svg>
                    {{ loadingGoogleAuth ? 'Autenticando...' : 'Google' }}

                </button>

                <button :disabled="loadingFacebookAuth" @click="loginWithFacebook"
                    class="flex items-center bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
                    <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M22 12.1C22 6.4 17.5 2 12 2S2 6.4 2 12.1c0 5.1 3.7 9.3 8.5 10V15h-2v-2h2v-1.5c0-2 1.1-3.1 3-3.1.9 0 1.8.1 1.8.1v2H14c-1.1 0-1.4.5-1.4 1.3V13h2.3l-.4 2h-1.9v7.1c4.8-.7 8.4-4.9 8.4-10z" />
                    </svg>
                    Facebook
                </button>
            </div>

            <p class="text-center text-gray-600 mt-4">
                Não tem conta? <button @click="openModal('register-user')" class="text-blue-500">Cadastre-se</button>
            </p>
        </div>

        <!--start modals-->
        <modal-register-user :modal="modal" @close="closeModal" @openLogin="openModal('login-user')" />
        <modal-auth-user :modal="modal" @close="closeModal" @recoverPassword="openModal('recover-password')" />
        <modal-recover-password :modal="modal" @close="closeModal" @openLogin="openModal('login-user')" />
        <!--end modals-->
    </div>
</template>

<style></style>