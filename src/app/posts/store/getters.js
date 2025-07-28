export default {
  posts: (state) => state.posts,
  post: (state) => state.post,
  originalPost: (state) => state.originalPost,
  replies: (state) => state.replies,
  repliesStore: (state) => state.repliesStore,
  postsMap: (state) => {
    const map = new Map();
    state.posts.forEach((post) => map.set(post.byId, post));
    return map;
  },
  getPostsByTab: (state, getters) => (tab) => getters.postsMap.get(tab) || null,
};
