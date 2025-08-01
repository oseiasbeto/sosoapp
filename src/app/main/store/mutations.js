export default {
    OPEN_DRAWER(state, content) {
        state.drawerContent = {
            name: content?.name,
            show: true,
            data: content?.data
        }; // Opcional: passar conteúdo para o modal
    },
    OPEN_MODAL(state, content) {
        state.modalContent = {
            name: content?.name,
            show: true,
            data: content?.data
        }; // Opcional: passar conteúdo para o modal
    },
    CLOSE_MODAL(state) {
        state.modalContent = {
            name: '',
            show: false,
            data: {}
        }
    },
    CLOSE_DRAWER(state) {
        state.drawerContent = {
            name: '',
            show: false,
            data: {}
        }
    }
};