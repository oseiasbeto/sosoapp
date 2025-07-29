export default {
    setPost({ commit }, post) {
        commit('SET_POST', post);
    },
    setOriginalPost({ commit }, originalPost) {
        commit('SET_ORIGINAL_POST', originalPost);
    },
    setLoadPosts({ commit }, { posts, byId, page, hasMore, totalPages, total }) {
        commit('SET_LOAD_POSTS', { posts, page, byId, hasMore, totalPages, total });
    },
    addPostFromModules({ commit }, { postModule }) {
        commit('ADD_POST_FROM_MODULES', { postModule });
    },
    setReplies({ commit }, { replies, original_post, page, total, totalPages, hasMore }) {
        commit("SET_REPLIES", { replies, page, original_post, total, totalPages, hasMore });
    },
    setLoadReplies({ commit }, { replies, total, page, totalPages, hasMore }) {
        commit("SET_LOAD_REPLIES", { replies, total, page, totalPages, hasMore });
    },
    setRepliesStore({ commit }, { original_post, rafs, replies, page, total, totalPages, hasMore }) {
        commit("SET_REPLIES_STORE", { original_post, rafs, replies, page, total, totalPages, hasMore });
    },
    resetReplies({ commit }) {
        commit("RESET_REPLIES");
    },
    resetRepliesStore({ commit }) {
        commit("RESET_REPLIES_STORE");
    },
    addNewPost({ commit }, newPost, postModule) {
        commit('ADD_NEW_POST', newPost, postModule);
    },
    addReplyFromReplies({ commit }, newReply, postModule) {
        commit('ADD_REPLY_FROM_REPLIES', newReply, postModule);
    },
    addReplyFromRepliesStore({ commit }, { index, postModule, newReply }) {
        commit('ADD_REPLY_FROM_REPLIES_STORE', { index, postModule, newReply });
    },
    setScrollTopRepliesStore({ commit }, { originalPostId, value }) {
        commit('SET_SCROLLTOP_REPLIES_STORE', { originalPostId, value });
    },
    setScrollTopFromPosts({ commit }, { byId, value }) {
        commit('SET_SCROLLTOP_FROM_POSTS', { byId, value });
    },
    setTabFromPosts({ commit }, { byId, tab }) {
        commit('SET_TAB_FROM_POSTS', { byId, tab });
    },
    incRepliesCountFromPosts({ commit }, { index, moduleIndex, isRepost, newReply }) {
        commit('INC_REPLIES_COUNT_FROM_POSTS', { index, moduleIndex, isRepost, newReply });
    },
    incRepliesCountFromReplies({ commit }, { index, postModule, newReplyId }) {
        commit('INC_REPLIES_COUNT_FROM_REPLIES', { index, postModule, newReplyId });
    },
    incRepliesCountFromRepliesStore({ commit }, { index, postModule, newReplyId }) {
        commit('INC_REPLIES_COUNT_FROM_REPLIES_STORE', { index, postModule, newReplyId });
    },
    toggleLikePost({ commit }, { postId, postModule, userId, isRepost, originalRepostId }) {
        commit('TOGGLE_LIKE_POST', { postId, postModule, userId, isRepost, originalRepostId });
    },
    toggleLikeReply({ commit }, { replyId, userId, postModule, isOriginalPost, originalRepostId }) {
        commit('TOGGLE_LIKE_REPLY', { replyId, userId, postModule, isOriginalPost, originalRepostId });
    },
    toggleRepostPost({ commit }, { postId, isViewPage, originalPostId, isRepost, postModule, userId }) {
        commit('TOGGLE_REPOST_POST', {originalPostId, postId, isViewPage, isRepost, postModule, userId });
    },
    toggleRepostReply({ commit }, { replyId, userId, postModule, isPost, isViewPage }) {
        commit('TOGGLE_REPOST_REPLY', { replyId, userId, postModule, isPost, isViewPage });
    },
    replaceRepliesStore({ commit }, { originalPostId }) {
        commit('REPLACE_REPLIES_STORE', { originalPostId });
    },
    deletePostFromPosts({ commit }, { postId, postModule, isViewPage }) {
        commit('DELETE_POST_FROM_POSTS', { postId, postModule, isViewPage });
    }
};