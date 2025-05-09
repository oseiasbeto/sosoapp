export default {
    setPost({ commit }, post) {
        commit('SET_POST', post);
    },
    setOriginalPost({ commit }, originalPost) {
        commit('SET_ORIGINAL_POST', originalPost);
    },
    setLoadPosts({ commit }, { posts, page, totalPages, total }) {
        commit('SET_LOAD_POSTS', { posts, page, totalPages, total });
    },
    setReplies({ commit }, { replies, original_post, page, totalPages, total }) {
        commit("SET_REPLIES", { replies, page, original_post, totalPages, total });
    },
    setLoadReplies({ commit }, { replies, page, totalPages, total }) {
        commit("SET_LOAD_REPLIES", { replies, page, totalPages, total });
    },
    setRepliesStore({ commit }, { original_post, rafs, replies, page, totalPages, total }) {
        commit("SET_REPLIES_STORE", { original_post, rafs, replies, page, totalPages, total });
    },
    resetReplies({ commit }) {
        commit("RESET_REPLIES");
    },
    resetRepliesStore({ commit }) {
        commit("RESET_REPLIES_STORE");
    },
    addNewPost({ commit }, newPost) {
        commit('ADD_NEW_POST', newPost);
    },
    addReplyFromReplies({ commit }, newReply) {
        commit('ADD_REPLY_FROM_REPLIES', newReply);
    },
    addReplyFromRepliesStore({ commit }, { index, newReply }) {
        commit('ADD_REPLY_FROM_REPLIES_STORE', { index, newReply });
    },
    incRepliesCountFromPosts({ commit }, { index, newReplyId }) {
        commit('INC_REPLIES_COUNT_FROM_POSTS', { index, newReplyId });
    },
    incRepliesCountFromReplies({ commit }, { index, newReplyId }) {
        commit('INC_REPLIES_COUNT_FROM_REPLIES', { index, newReplyId });
    },
    incRepliesCountFromRepliesStore({ commit }, { index, newReplyId }) {
        commit('INC_REPLIES_COUNT_FROM_REPLIES_STORE', { index, newReplyId });
    },
    toggleLikePost({ commit }, { postId, userId, isRepost, originalRepostId }) {
        commit('TOGGLE_LIKE_POST', { postId, userId, isRepost, originalRepostId });
    },
    toggleLikeReply({ commit }, { replyId, userId, isOriginalPost }) {
        commit('TOGGLE_LIKE_REPLY', { replyId, userId, isOriginalPost });
    },
    toggleRepostPost({ commit }, { postId, isViewPage, userId }) {
        commit('TOGGLE_REPOST_POST', { postId, isViewPage, userId });
    },
    toggleRepostReply({ commit }, { replyId, userId, isPost, isViewPage }) {
        commit('TOGGLE_REPOST_REPLY', { replyId, userId, isPost, isViewPage });
    },
    replaceRepliesStore({ commit }, { originalPostId }) {
        commit('REPLACE_REPLIES_STORE', { originalPostId });
    }
};