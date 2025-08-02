import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.130:5050';
let socket;

/**
 * Conecta ao WebSocket do servidor.
 * @param {string} token - Token de autenticação do usuário.
 * @returns {Socket} - Instância do socket.
 */
export function connectSocket(token) {
    if (!socket) {
        console.log('Tentando conectar ao WebSocket com token:', token ? 'Token presente' : 'Token ausente');
        socket = io(SOCKET_URL, {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('Conectado ao WebSocket:', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Erro na conexão WebSocket:', error.message);
        });

        socket.on('disconnect', () => {
            console.log('Desconectado do WebSocket');
            socket = null; // Limpa a instância para reconexão futura
        });
    } else {
        console.log('Socket já conectado:', socket.id);
    }

    return socket;
}

/**
 * Retorna a instância atual do socket, se existir.
 * @returns {Socket|null} - Instância do socket ou null se não conectado.
 */
export function getSocket() {
    return socket;
}

/**
 * Desconecta do WebSocket.
 */
export function disconnectSocket() {
    if (socket) {
        console.log('Desconectando socket...');
        socket.disconnect();
        socket = null;
    }
}