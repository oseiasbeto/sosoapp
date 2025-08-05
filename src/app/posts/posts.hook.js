// Importa a instância da API configurada para fazer requisições ao backend.
import api from "@/api";

// Importa `ref` do Vue para criar variáveis reativas.
import { ref } from "vue";

// Importa `useStore` do Vuex para acessar o estado global da aplicação.
import { useStore } from "vuex";

export function usePost() {
  // Variável reativa para indicar se uma operação assíncrona está em andamento.
  const loading = ref(false);

  // Obtém a instância do Vuex Store, permitindo acessar e modificar o estado global da aplicação.
  const store = useStore();

  // Função assíncrona para registrar um novo usuário.
  const createPost = async (data) => {
    try {
      loading.value = true;

      const response = await api.post(
        `/posts/new-post?post_module=${data.postModule}`,
        {
          ...data,
          originalPost: data.isRepost ? data.originalRepost : data.originalPost,
        }
      );

      const { new_post } = response.data;

      if (!data?.isReply) {
        const newPost = new_post;
        store.dispatch("addNewPost", { newPost, postModule: data.postModule });
      } else {
        // Obtém a lista de Kools visualizados
        const replies = store.getters.replies.data || [];
        const repliesStore = store.getters.repliesStore || [];
        const newReply = new_post;

        if (data.shouldAddReply) {
          const index = repliesStore.findIndex((d) =>
            data.byRepostId
              ? d.original_post._id === data?.byRepostId
              : data.isRepost
              ? d.original_post._id === data.originalPost
              : d.original_post._id === new_post.original_post._id
          );

          if (index !== -1) {
            store.dispatch("addReplyFromReplies", {
              newReply,
              postModule: data.postModule,
            });
            store.dispatch("addReplyFromRepliesStore", {
              index,
              postModule: data.postModule,
              newReply,
            });
            store.dispatch("incRepliesCountFromRepliesStore", {
              index,
              postModule: data.postModule,
              newReplyId: newReply._id,
            });
          }
        } else {
          if (data.addReplyFrom == "original_post") {
            const moduleIndex = store.getters.posts.findIndex(
              (m) => m.byId === data.postModule
            );

            if (moduleIndex === -1) return;
            const module = store.getters.posts[moduleIndex];

            if (!data.isRepost) {
              const index = module.posts.findIndex((post) =>
                data.originalRepostId
                  ? post._id === data?.originalRepostId
                  : post._id === newReply.original_post._id
              );

              if (index !== -1) {
                store.dispatch("incRepliesCountFromPosts", {
                  index,
                  moduleIndex,
                  isRepost: data.isRepost,
                  postModule: data.postModule,
                  newReply,
                });

                let indexReply = -1;
                indexReply = repliesStore.findIndex(
                  (r) => r.original_post?._id === newReply?.original_post?._id
                );

                if (indexReply !== -1) {
                  store.dispatch("addReplyFromRepliesStore", {
                    index: indexReply,
                    postModule: data.postModule,
                    newReply,
                  });
                }
              }
            } else {
              const index = module.posts.findIndex(
                (post) =>
                  post?.original_post?._id === newReply.original_post._id
              );

              if (index !== -1) {
                store.dispatch("incRepliesCountFromPosts", {
                  index,
                  moduleIndex,
                  isRepost: data.isRepost,
                  postModule: data.postModule,
                  newReply,
                });

                let indexReply = -1;
                indexReply = repliesStore.findIndex(
                  (r) => r.original_post?._id === newReply?.original_post?._id
                );

                if (indexReply !== -1) {
                  store.dispatch("addReplyFromRepliesStore", {
                    index: indexReply,
                    postModule: data.postModule,
                    newReply,
                  });
                }
              }
            }
          } else {
            const indexStore = repliesStore.findIndex(
              (d) => d?.original_post?._id === newReply?.original_post?._id
            );

            if (indexStore !== -1) {
              store.dispatch("addReplyFromRepliesStore", {
                index: indexStore,
                postModule: data.postModule,
                newReply,
              });
              store.dispatch("incRepliesCountFromRepliesStore", {
                index: indexStore,
                postModule: data.postModule,
                newReplyId: newReply._id,
              });
            } else {
              const index = replies.findIndex(
                (reply) => reply._id === newReply.original_post._id
              );
              if (index !== -1) {
                store.dispatch("incRepliesCountFromReplies", {
                  index: index,
                  postModule: data.postModule,
                  newReplyId: newReply._id,
                });
              }
            }
          }
        }
      }
      return response; // Retorna a resposta da API.
    } catch (err) {
      console.log(err.message); // Exibe o erro no console.
      throw err; // Repassa o erro para o chamador.
    } finally {
      loading.value = false; // Desativa o estado de carregamento.
    }
  };

  const getReplies = async ({
    original_post,
    rafs = false,
    page = 1,
    limit = 10,
  }) => {
    try {
      loading.value = true;

      const response = await api.get(
        `/posts/replies/${
          original_post.is_repost
            ? original_post.original_post._id
            : original_post._id
        }?page=${page}&limit=${limit}`
      );
      const {
        posts: replies,
        page: currentPage,
        totalPages,
        hasMore,
        total,
      } = response.data;

      store.dispatch("setReplies", {
        replies,
        page: currentPage,
        original_post,
        hasMore,
        totalPages,
        total,
      });

      store.dispatch("setRepliesStore", {
        original_post,
        replies,
        rafs,
        page: currentPage,
        totalPages,
        total,
      });
    } catch (err) {
      console.error("Erro ao carregar as respostas:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadMoreReplies = async ({
    original_post,
    isLoad = true,
    totalItems = 0,
    page = 1,
    limit = 10,
  }) => {
    try {
      loading.value = true;

      const response = await api.get(
        `/posts/replies/${
          original_post.is_repost
            ? original_post.original_post._id
            : original_post._id
        }?page=${page}&limit=${limit}&is_load=${isLoad}&total=${totalItems}`
      );
      const {
        posts: replies,
        page: currentPage,
        totalPages,
        hasMore,
        total,
      } = response.data;

      store.dispatch("setLoadReplies", {
        replies,
        page: currentPage,
        totalPages,
        hasMore,
        total,
      });

      store.dispatch("setRepliesStore", {
        original_post,
        replies,
        page: currentPage,
        totalPages,
        total,
      });
    } catch (err) {
      console.error("Erro ao carregar as respostas:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPostById = async (id) => {
    try {
      loading.value = true;
      const response = await api.get(`/posts/${id}`);
      const { post } = response.data;

      store.dispatch("setPost", post);
      store.dispatch("setOriginalPost", post);
    } catch (err) {
      console.error("Erro ao carregar a postagem:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getOriginalPostById = async (id) => {
    try {
      loading.value = true;
      const response = await api.get(`/posts/${id}`);
      const { post } = response.data;

      store.dispatch("setOriginalPostFromPost", post);
    } catch (err) {
      console.error("Erro ao carregar a postagem:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleLike = async ({
    postId,
    originalRepostId,
    postModule,
    isRepost = false,
    isReply = false,
    isOriginalPost = false,
  }) => {
    try {
      loading.value = true;
      const response = await api.put(
        `/posts/like/${postId}?post_module=${postModule}`
      );

      if (isReply) {
        const replyId = postId;
        const userId = store.getters.currentUser._id;
        store.dispatch("toggleLikeReply", {
          replyId,
          postModule,
          userId,
          isOriginalPost,
          originalRepostId,
        });
      } else {
        const userId = store.getters.currentUser._id;

        store.dispatch("toggleLikePost", {
          postId,
          postModule,
          userId,
          isRepost,
          originalRepostId,
        });
      }

      return response;
    } catch (err) {
      console.error("Erro ao carregar a postagem:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleRepost = async ({
    originalPost,
    postModule,
    isRepost = false,
    isPost = false,
    isViewPage = false,
  }) => {
    try {
      loading.value = true;
      const response = await api.put(
        `/posts/repost/${originalPost._id}?post_module=${postModule}`
      );

      if (originalPost.is_reply) {
        const replyId = originalPost._id;
        const userId = store.getters.currentUser._id;

        store.dispatch("toggleRepostReply", {
          replyId,
          postModule,
          isPost,
          userId,
          isViewPage,
        });
      } else {
        const postId = originalPost._id;
        const userId = store.getters.currentUser._id;

        store.dispatch("toggleRepostPost", {
          postId,
          postModule,
          isRepost,
          userId,
          isViewPage,
        });
      }
      return response;
    } catch (err) {
      console.error("Erro ao repostar:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPosts = async ({ page = 1, tab = "feed", limit = 10 }) => {
    try {
      loading.value = true;
      const response = await api.get(
        `/posts/${tab}?page=${page}&limit=${limit}`
      );
      const {
        posts,
        page: currentPage,
        total,
        hasMore,
        totalPages,
      } = response.data;

      const newModule = {
        byId: tab,
        posts,
        pagination: {
          page: currentPage,
          total,
          hasMore,
          totalPages,
        },
      };

      store.dispatch("addPostFromModules", { postModule: newModule });
      return newModule;
    } catch (err) {
      console.error("Erro ao carregar as postagens:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getProfilePosts = async ({
    page = 1,
    userId,
    tab = "feed",
    limit = 10,
  }) => {
    try {
      loading.value = true;
      const response = await api.get(
        `/posts/profile/${tab}/${userId}?page=${page}&limit=${limit}`
      );
      const {
        posts,
        page: currentPage,
        total,
        hasMore,
        totalPages,
      } = response.data;

      const newModule = {
        byId: `profile_${tab}_${userId}`,
        posts,
        pagination: {
          page: currentPage,
          hasMore,
          total,
          totalPages,
        },
      };

      store.dispatch("addPostFromModules", { postModule: newModule });
      return newModule;
    } catch (err) {
      console.error("Erro ao carregar as postagens:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadMoreProfilePosts = async ({
    page = 1,
    tab = "feed",
    userId,
    isLoad = true,
    totalItems = 0,
    limit = 10,
  }) => {
    try {
      loading.value = true;
      const response = await api.get(
        `/posts/profile/${tab}/${userId}?page=${page}&limit=${limit}&is_load=${isLoad}&total=${totalItems}`
      );
      const {
        posts,
        page: currentPage,
        totalPages,
        hasMore,
        total,
      } = response.data;

      const newModule = {
        posts,
        byId: `profile_${tab}_${userId}`,
        page: currentPage,
        hasMore,
        totalPages,
        total,
      };

      store.dispatch("setLoadPosts", newModule);
    } catch (err) {
      console.error("Erro ao carregar as postagens:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const serchPosts = async ({
    page = 1,
    tab = "feed",
    recentOnly = false,
    searchQuery,
    limit = 10,
  }) => {
    try {
      loading.value = true;
      const response = await api.get(
        `/posts/search?q=${searchQuery}&page=${page}&limit=${limit}&recent_only=${recentOnly}`
      );
      const {
        posts,
        page: currentPage,
        total,
        hasMore,
        totalPages,
      } = response.data;

      const newModule = {
        byId: tab,
        posts,
        pagination: {
          page: currentPage,
          total,
          hasMore,
          totalPages,
        },
      };

      return newModule;
    } catch (err) {
      console.error("Erro ao carregar as postagens:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadMorePosts = async ({
    page = 1,
    totalItems = 0,
    tab = "feed",
    limit = 10,
  }) => {
    try {
      loading.value = true;
      const response = await api.get(
        `/posts/${tab}?page=${page}&limit=${limit}&is_load=true&total=${totalItems}`
      );

      const {
        posts,
        page: currentPage,
        total,
        totalPages,
        hasMore,
      } = response.data;

      const newModule = {
        posts,
        page: currentPage,
        byId: tab,
        total,
        totalPages,
        hasMore,
      };
      store.dispatch("setLoadPosts", newModule);
    } catch (err) {
      console.error("Erro ao carregar as postagens:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePost = async ({
    postId,
    postModule,
    isViewPage = false,
    isReply,
  }) => {
    try {
      loading.value = true;
      const response = await api.delete(`/posts/${postId}`);

      if (!isReply) {
        store.dispatch("deletePostFromPosts", {
          postId,
          postModule,
          isViewPage,
        });
      }
      return response;
    } catch (err) {
      console.error("Erro ao repostar:", err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Retorna as funções e a variável reativa `loading` para serem usadas nos componentes Vue.
  return {
    loading,
    createPost,
    getReplies,
    toggleLike,
    toggleRepost,
    getProfilePosts,
    loadMoreProfilePosts,
    getOriginalPostById,
    loadMoreReplies,
    deletePost,
    loadMorePosts,
    serchPosts,
    getPosts,
    getPostById,
  };
}
