// Importa a instância da API configurada para fazer requisições ao backend.
import api from "../api";

// Importa `ref` do Vue para criar variáveis reativas.
import { ref } from 'vue';

// Importa `useStore` do Vuex para acessar o estado global da aplicação.
import { useStore } from "vuex";

// Importa a biblioteca js-cookie para manipular cookies no navegador.
import Cookies from "js-cookie";

// Importa funções auxiliares para manipulação de tokens e sessão.
import decodeToken from "@/utils/decode-token"; // Decodifica um token JWT.
import clearSessionIdFromCookies from "@/utils/clear-session-id-from-cookies"; // Remove o session_id dos cookies.
import setSessionIdFromCookies from "@/utils/set-session-id-from-cookies"; // Armazena o session_id nos cookies.

// Importa a função para conectar ao WebSocket (Socket.IO).
import { connectSocket, disconnectSocket } from "@/services/socket";

// Variável global usada para armazenar o timeout de renovação do token.
let refreshTimeout = null;

// Função composable `useAuth` que gerencia autenticação e sessão do usuário.
export function useAuth() {
    // Variável reativa para indicar se uma operação assíncrona está em andamento.
    const loading = ref(false);

    // Obtém a instância do Vuex Store, permitindo acessar e modificar o estado global da aplicação.
    const store = useStore();

    // Função assíncrona para registrar um novo usuário.
    const registerUser = async (data) => {
        try {
            loading.value = true; // Ativa o estado de carregamento.

            // Envia os dados do usuário para a API.
            const response = await api.post("/auth/register-user", data);
            return response; // Retorna a resposta da API.
        } catch (err) {
            console.log(err.message); // Exibe o erro no console.
            throw err; // Repassa o erro para o chamador.
        } finally {
            loading.value = false; // Desativa o estado de carregamento.
        }
    };

    // Função assíncrona para verificar o e-mail do usuário com um token.
    const verifyEmail = async (token) => {
        try {
            loading.value = true;

            // Envia o token para a API para confirmação do e-mail.
            const response = await api.post("/auth/verify-email", { token });

            // Extrai os dados do usuário e tokens da resposta.
            const user = response.data.user;
            const accessToken = response.data.access_token;
            const sessionId = response.data.session_id;

            // Armazena o usuário e token no Vuex.
            store.dispatch("login", { user, token: accessToken });

            // Agenda a renovação automática do token.
            scheduleTokenRefresh(accessToken);

            // Salva o session_id nos cookies.
            setSessionIdFromCookies(sessionId);

            // Conecta ao WebSocket e informa ao backend que o usuário está online.
            const socket = connectSocket(accessToken);
            socket.emit('setUserOnline', user._id);
        } catch (err) {
            console.log(err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Função para autenticar um usuário via e-mail e senha.
    const authUser = async (data) => {
        try {
            loading.value = true;

            // Envia os dados de login para a API.
            const response = await api.post("/auth/auth-user", data);

            // Extrai os dados da resposta.
            const user = response.data.user;
            const accessToken = response.data.access_token;
            const sessionId = response.data.session_id;

            // Atualiza o estado global com os dados do usuário.
            store.dispatch("login", { user, token: accessToken });

            // Configura a renovação automática do token.
            scheduleTokenRefresh(accessToken);

            // Armazena o session_id nos cookies.
            setSessionIdFromCookies(sessionId);

            // Conecta ao WebSocket e marca o usuário como online.
            const socket = connectSocket(accessToken);
            socket.emit('setUserOnline', user._id);
        } catch (err) {
            console.log(err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Função para autenticar um usuário via e-mail e senha.
    const logoutUser = async (sessionId) => {
        try {
            loading.value = true;

            await api.delete(`/auth/destroy-session/${sessionId}`)

            store.dispatch("logout");
            clearSessionIdFromCookies();
            disconnectSocket()
        } catch (err) {
            console.log(err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Função para autenticar um usuário via Google OAuth.
    const googleAuth = async (token) => {
        try {
            loading.value = true;

            // Envia o token OAuth para a API.
            const response = await api.post("/auth/google-auth", { token });

            const user = response.data.user;
            const accessToken = response.data.access_token;
            const sessionId = response.data.session_id;

            store.dispatch("login", { user, token: accessToken });

            scheduleTokenRefresh(accessToken);
            setSessionIdFromCookies(sessionId);

            const socket = connectSocket(accessToken);
            socket.emit('setUserOnline', user._id);
        } catch (err) {
            console.log(err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Função para autenticar um usuário via Facebook OAuth.
    const facebookAuth = async (data) => {
        try {
            loading.value = true;

            const response = await api.post("/auth/facebook-auth", data);

            const user = response.data.user;
            const accessToken = response.data.access_token;
            const sessionId = response.data.session_id;

            store.dispatch("login", { user, token: accessToken });

            scheduleTokenRefresh(accessToken);
            setSessionIdFromCookies(sessionId);

            const socket = connectSocket(accessToken);
            socket.emit('setUserOnline', user._id);
        } catch (err) {
            console.log(err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Função para renovar o token de acesso usando o session_id.
    const refreshToken = async (sessionId) => {
        try {
            loading.value = true;

            const res = await api.post("/auth/refresh-access-token", { session_id: sessionId });

            const user = res.data.user;
            const accessToken = res.data.access_token;

            store.dispatch("login", { user, token: accessToken });

            scheduleTokenRefresh(accessToken);

            const socket = connectSocket(accessToken);
            socket.emit('setUserOnline', user._id);
        } catch (err) {
            if (err.response?.status === 401) {
                // Se a resposta indicar que o token não é mais válido, limpa o session_id.
                clearSessionIdFromCookies();
                disconnectSocket()
            }
            console.log(err.message);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Função que agenda a renovação automática do token de acesso.
    function scheduleTokenRefresh(token) {
        if (refreshTimeout) clearTimeout(refreshTimeout); // Cancela qualquer timeout anterior.

        // Decodifica o token JWT para obter a data de expiração.
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            throw new Error("Token inválido ou sem campo exp.");
        }

        // Converte o tempo de expiração para milissegundos.
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilRefresh = expirationTime - currentTime - 60 * 1000; // Programa a renovação 1 min antes.

        if (timeUntilRefresh > 0) {
            refreshTimeout = setTimeout(async () => {
                try {
                    const session_id = Cookies.get("session_id");
                    await refreshToken(session_id);
                } catch (error) {
                    console.error("Erro ao renovar o token automaticamente:", error);
                }
            }, timeUntilRefresh);
        }
    }

    // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
    return { loading, registerUser, verifyEmail, authUser, logoutUser, googleAuth, facebookAuth, refreshToken };
}
