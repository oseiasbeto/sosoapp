export default {
    SET_POST(state, post) {
        state.post = post
    },

    SET_ORIGINAL_POST(state, originalPost) {
        state.originalPost = originalPost
    },

    SET_LOAD_POSTS(state, { posts, page, totalPages, total }) {
        state.posts.data = [...state.posts.data, ...posts]
        state.posts.pagination.currentPage = page;
        state.posts.pagination.totalPages = totalPages;
        state.posts.pagination.hasMore = page < totalPages
    },

    ADD_POST_FROM_MODULES(state, { postModule }) {
        state.posts.push(postModule)
    },

    ADD_NEW_POST(state, { newPost, postModule }) {
        console.log(postModule)
        const moduleIndex = state.posts.findIndex(m => m.byId === postModule)

        if (moduleIndex === -1) return
        const module = state.posts[moduleIndex]

        module.posts = [newPost, ...(Array.isArray(module.posts) ? module.posts : [])]
    },

    SET_REPLIES(state, { replies, page, original_post, totalPages }) {
        state.replies.data = replies
        state.replies.lastRequest = {
            originalPostId: original_post._id,
            at: Date.now()
        }
        state.replies.pagination.currentPage = page;
        state.replies.pagination.totalPages = totalPages;
        state.replies.pagination.hasMore = page < totalPages
    },

    SET_LOAD_REPLIES(state, { replies, page, totalPages, total }) {
        state.replies.data = [...state.replies.data, ...replies]
        state.replies.pagination.currentPage = page;
        state.replies.pagination.totalPages = totalPages;
        state.replies.pagination.hasMore = page < totalPages
    },

    SET_REPLIES_STORE(state, { original_post, replies, page: currentPage, totalPages, total }) {
        if (!original_post || !original_post._id) return;

        const existingPostIndex = state.repliesStore.findIndex(data => data.original_post._id === original_post._id);

        if (existingPostIndex === -1) {
            const newItem = {
                original_post,
                replies: {
                    data: replies,
                    lastRequest: {
                        originalPostId: original_post._id,
                        at: Date.now()
                    },
                    pagination: {
                        currentPage,
                        totalPages,
                        hasMore: currentPage < totalPages
                    }
                }
            }
            state.repliesStore.push({ ...newItem });
        } else {
            const newItem = {
                data: replies,
                pagination: {
                    currentPage,
                    lastRequest: {
                        originalPostId: original_post._id,
                        at: Date.now()
                    },
                    totalPages,
                    hasMore: currentPage < totalPages
                }
            }
            state.repliesStore[existingPostIndex]
                .replies.data = [
                    ...state.repliesStore[existingPostIndex].replies.data,
                    ...newItem.data
                ]

            state.repliesStore[existingPostIndex].replies.pagination = newItem.pagination
        }
    },

    RESET_REPLIES(state) {
        state.replies = {
            data: [],
            lastRequest: {
                originalPostId: null,
                at: null
            },
            pagination: {}
        }
    },

    RESET_REPLIES_STORE(state) {
        state.repliesStore = []
    },

    ADD_REPLY_FROM_REPLIES(state, { newReply, postModule }) {
         console.log("aki")
        const replies = state.replies
        replies.data = [
            newReply,
            ...replies.data
        ]
    },

    ADD_REPLY_FROM_REPLIES_STORE(state, { index, postModule, newReply }) {
         console.log("aki")
        if (index === -1 || !state.repliesStore || !state.repliesStore[index]) return;
        const repliesStore = state.repliesStore
        const item = state.repliesStore[index];

        if (item?.replies && newReply) {
            item.replies.data = [
                newReply,
                ...item.replies.data
            ]
        }

        if (newReply?.original_post?.is_reply && newReply?.original_post?.reposts?.length) {

            if (repliesStore.length) {

                const indexStore = repliesStore.findIndex(r => r.original_post._id === newReply?.original_post?._id)

                if (indexStore === -1) return

                const itemTwo = repliesStore[indexStore]

                if (itemTwo?.original_post?._id !== item?.original_post?._id) {
                    itemTwo.replies.data = [
                        newReply,
                        ...itemTwo.replies.data
                    ]
                }
            }
        }
    },

    INC_REPLIES_COUNT_FROM_POSTS(state, { index, moduleIndex, newReply }) {
        console.log("aki")
        if (index === -1 || moduleIndex === -1) return;

        const module = state.posts[moduleIndex]

        if (!module) return

        const item = module.posts[index];

        if (!item) return

        if (!item.is_repost) {
            item.replies.push(newReply._id)
            if (item.reposts) {
                const posts = module.posts
                posts.map(p => {
                    if (p?.original_post?._id === item._id) {
                        p.original_post.replies.push(newReply._id)
                    }
                })
            }
        } else {
            item.original_post.replies.push(newReply._id)

            if (item.original_post.reposts) {
                const posts = module.posts
                posts.map(p => {
                    if (p?.original_post?._id === item?.original_post?._id && p?._id !== item?._id) {
                        p.original_post.replies.push(newReply._id)
                    }

                    if (p?._id === item?.original_post?._id) {
                        p.replies.push(newReply._id)
                    }
                })
            }
        }
    },

    INC_REPLIES_COUNT_FROM_REPLIES(state, { index, postModule, newReplyId }) {
        console.log("aki")
        if (index === -1 || !state.replies || !state.replies.data[index]) return;

        const item = state.replies.data[index];

        item.replies.push(newReplyId)

        /*
        if (index === -1 || !state.repliesStore || !state.repliesStore[index]) return;
    const item = state.repliesStore[index];

    // Adiciona o newReplyId ao repliesStore, se ainda não estiver presente
    if (!item.original_post.replies.includes(newReplyId)) {
        item.original_post.replies.push(newReplyId);
    }

    const module = state.posts.find(m => m.byId === postModule);
    if (!module) return;

    const posts = module.posts;
    if (posts.length && item.original_post.reposts.length) {
        posts.forEach(p => {
            // Atualiza apenas se o reply ainda não foi adicionado
            if (p?.original_post?._id === item?.original_post?._id && !p.original_post.replies.includes(newReplyId)) {
                p.original_post.replies.push(newReplyId);
            }
            if (p?._id === item?.original_post?._id && !p.replies.includes(newReplyId)) {
                p.replies.push(newReplyId);
            }
        });
    }
        */
    },

    INC_REPLIES_COUNT_FROM_REPLIES_STORE(state, { index, newReplyId }) {
        console.log("aki")
        if (index === -1 || !state.repliesStore || !state.repliesStore[index]) return;
        const item = state.repliesStore[index];

        // Adiciona o newReplyId apenas no repliesStore
        item.original_post.replies.push(newReplyId);
    },

    TOGGLE_LIKE_POST(state, { postId, userId, postModule, isRepost, originalRepostId }) {
        if (!isRepost) {

            const module = state.posts.find(m => m.byId === postModule)

            if (!module) return

            const post = module.posts.find(p => p._id === postId);

            const posts = module.posts

            if (!post) return;

            const index = post.likes.indexOf(userId);

            if (index === -1) {
                post.likes.push(userId);
                if (post.reposts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === post?._id) {
                            p.original_post.likes.push(userId)
                        }
                    })
                }
            } else {
                post.likes.splice(index, 1);
                if (post.reposts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === post?._id) {
                            p.original_post.likes.splice(index, 1)
                        }
                    })
                }
            }
        } else {
            const module = state.posts.find(m => m.byId === postModule)
            if (!module) return

            const posts = module.posts
            const post = posts.find(p => p._id === originalRepostId);

            const repliesStore = state.repliesStore

            if (!post) return;

            const index = post.original_post.likes.indexOf(userId);


            if (index === -1) {
                post.original_post.likes.push(userId);
                console.log(post)

                if (post.original_post.reposts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === post?.original_post?._id && p._id !== post._id) {
                            p.original_post.likes.push(userId)
                        }

                        if (p?._id === post?.original_post?._id) {
                            p.likes.push(userId)
                        }
                    })
                }


                if (repliesStore.length && post.is_reply) {
                    const indexStore = repliesStore.findIndex(r => r?.original_post?._id === post?.original_post?.original_post?._id)

                    if (indexStore === -1) return

                    const replies = repliesStore[indexStore].replies.data

                    if (replies.length) {
                        replies.map(r => {
                            if (r._id === post?.original_post?._id) {
                                r.likes.push(userId)
                            }
                        })
                    }
                }
            } else {
                post.original_post.likes.splice(index, 1);
                if (post.original_post.reposts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === post?.original_post?._id) {
                            p.original_post.likes.splice(index, 1)
                        }

                        if (p?._id === post?.original_post?._id) {
                            p.likes.splice(index, 1)
                        }
                    })
                }

                if (repliesStore.length && post.is_reply) {
                    const indexStore = repliesStore.findIndex(r => r.original_post._id === post.original_post.original_post._id)
                    if (indexStore === -1) return

                    const replies = repliesStore[indexStore].replies.data
                    if (replies.length) {
                        replies.map(r => {
                            if (r._id === post?.original_post?._id) {
                                r.likes.splice(index, 1)
                            }
                        })
                    }
                }
            }
        }
    },

    TOGGLE_LIKE_REPLY(state, { replyId, originalRepostId, postModule, userId, isOriginalPost }) {

        const reply = state.replies.data.find(r => r._id === replyId);
        const post = state.post

        if (!isOriginalPost && !reply) return;

        if (isOriginalPost) {
            const index = post.likes.indexOf(userId);

            if (index === -1) {
                post.likes.push(userId)

                const module = state.posts.find(m => m.byId === postModule)
                if (!module) return

                const posts = module.posts
                if (post.reposts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === post?._id && p._id !== originalRepostId) {
                            p.original_post.likes.push(userId)
                        }
                        if (originalRepostId) {
                            if (p._id === post._id) {
                                p.likes.push(userId)
                            }
                        }
                    })
                }

                if (post?.originalRepostId) {
                    const _index = state.repliesStore.findIndex(r => r?.original_post?._id === post?.original_post?._id)

                    if (_index === -1) return
                    const _item = state.repliesStore[_index]
                    if (_item.replies.data.length) {
                        _item.replies.data.map(r => {
                            if (r._id === post._id) {
                                r.likes.push(userId)
                            }
                        })
                    }
                }
            } else {
                post.likes.splice(index, 1);
                const module = state.posts.find(m => m.byId === postModule)
                if (!module) return

                const posts = module.posts
                if (posts.length && post.reposts.length) {
                    posts.map(p => {

                        if (p?.original_post?._id === post._id && p._id !== originalRepostId) {
                            p.original_post.likes.splice(index, 1)
                        }

                        if (originalRepostId) {
                            if (p._id === post._id) {
                                p.likes.splice(index, 1)
                            }
                        }
                    })
                }

                if (post?.originalRepostId) {
                    const _index = state.repliesStore.findIndex(r => r?.original_post?._id === post?.original_post?._id)

                    if (_index === -1) return
                    const _item = state.repliesStore[_index]
                    if (_item.replies.data.length) {
                        _item.replies.data.map(r => {
                            if (r._id === post._id) {
                                r.likes.splice(index, 1)
                            }
                        })
                    }
                }
            }
        } else {
            const index = reply.likes.indexOf(userId);

            if (index === -1) {
                reply.likes.push(userId);

                const module = state.posts.find(m => m.byId === postModule)
                if (!module) return

                const posts = module.posts
                if (posts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === reply._id) {
                            p.original_post.likes.push(userId)
                        }
                    })
                }
            } else {
                reply.likes.splice(index, 1);

                const module = state.posts.find(m => m.byId === postModule)
                if (!module) return

                const posts = module.posts

                if (posts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === reply._id) {
                            p.original_post.likes.splice(index, 1)
                        }
                    })
                }
            }
        }
    },

    TOGGLE_REPOST_POST(state, { postId, postModule, isViewPage, userId }) {
        if (!isViewPage) {
            const module = state.posts.find(m => m.byId === postModule)
            if (!module) return

            const posts = module.posts

            const post = posts.find(p => p._id === postId);

            if (!post) return;

            const index = post.reposts.indexOf(userId);
            const repliesStore = state.repliesStore

            if (index === -1) {
                post.reposts.push(userId);

                if (posts.length && post.reposts.length) {
                    posts.map(p => {
                        if (post._id === p?.original_post?._id) {
                            p.original_post.reposts.push(userId)
                        }
                    })
                    if (repliesStore.length && post.is_reply) {
                        const indexStore = repliesStore.findIndex(r => r?.original_post?._id === post?.original_post?.original_post?._id)

                        if (indexStore === -1) return

                        const replies = repliesStore[indexStore].replies.data

                        if (replies.length) {
                            replies.map(r => {
                                if (r._id === post?.original_post?._id) {
                                    r.reposts.push(userId)
                                }
                            })
                        }
                    }
                }
            } else {
                post.reposts.splice(index, 1);

                if (posts.length) {

                    const index = posts.findIndex(p => p.is_repost && p.author._id === userId && p?.original_post._id === postId)

                    if (index !== -1) {
                        posts.splice(index, 1)
                    }

                    posts.map(p => {
                        if (p?.original_post?._id === post._id) {
                            const index = p.original_post.reposts.indexOf(userId)

                            if (index !== -1) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        }
                    })

                    if (repliesStore.length && post.is_reply) {
                        const indexStore = repliesStore.findIndex(r => r.original_post._id === post.original_post.original_post._id)
                        if (indexStore === -1) return

                        const replies = repliesStore[indexStore].replies.data
                        if (replies.length) {
                            replies.map(r => {
                                if (r._id === post?.original_post?._id) {
                                    r.reposts.splice(index, 1)
                                }
                            })
                        }
                    }
                }
            }
        } else {
            const post = state.post

            if (!post.is_repost) {
                const index = post.reposts.indexOf(userId)

                if (index === -1) {
                    post.reposts.push(userId)
                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts

                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === postId && p._id !== post._id) {
                                p.original_post.reposts.push(userId)
                            }
                        })
                    }
                } else {
                    post.reposts.splice(index, 1);
                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts

                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === postId) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        })
                    }
                }
            } else {
                const index = post.original_post.reposts.indexOf(userId)

                if (index === -1) {
                    post.original_post.reposts.push(userId);

                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts

                    if (posts.length && post.original_post.reposts.length) {

                        posts.map(p => {

                            if (p?.original_post?._id === postId && p._id !== post._id) {
                                p.original_post.reposts.push(userId)
                            }

                            if (p._id === postId) {
                                p.reposts.push(userId)
                            }
                        })
                    }
                } else {
                    post.original_post.reposts.splice(index, 1);

                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts

                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === postId) {
                                const index = p.original_post.reposts.indexOf(userId)
                                p.original_post.reposts.splice(index, 1)
                            }

                            if (p?._id === postId) {
                                const index = p.reposts.indexOf(userId)
                                p.reposts.splice(index, 1)
                            }
                        })
                    }
                }
            }
        }
    },

    TOGGLE_REPOST_REPLY(state, { replyId, postModule, isViewPage, isPost, userId }) {
        if (!isViewPage) {

            if (!isPost) {
                const reply = state.replies.data.find(r => r._id === replyId);

                const index = reply.reposts.indexOf(userId)
                if (index === -1) {
                    reply.reposts.push(userId)
                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts

                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === reply._id) {
                                p.original_post.reposts.push(userId)
                            }
                        })
                    }
                } else {
                    reply.reposts.splice(index, 1);

                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === reply._id) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        })
                    }
                }
            } else {
                const module = state.posts.find(m => m.byId === postModule)
                if (!module) return

                const posts = module.posts

                const post = posts.find(p => p?.original_post?._id === replyId);

                if (!post) return

                const originalPost = post.original_post
                const repliesStore = state.repliesStore
                const index = originalPost.reposts.indexOf(userId)

                if (index === -1) {
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === originalPost._id) {
                                p.original_post.reposts.push(userId)
                            }
                        })

                        if (repliesStore.length && originalPost.is_reply) {
                            const indexStore = repliesStore.findIndex(r => r?.original_post?._id === post?.original_post?.original_post?._id)

                            if (indexStore === -1) return

                            const replies = repliesStore[indexStore].replies.data

                            if (replies.length) {
                                replies.map(r => {
                                    if (r._id === post?.original_post?._id) {
                                        r.reposts.push(userId)
                                    }
                                })
                            }
                        }
                    }
                } else {
                    if (originalPost.reposts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === originalPost._id) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        })

                        if (repliesStore.length && originalPost.is_reply) {
                            const indexStore = repliesStore.findIndex(r => r.original_post._id === post.original_post.original_post._id)
                            if (indexStore === -1) return

                            const replies = repliesStore[indexStore].replies.data
                            if (replies.length) {
                                replies.map(r => {
                                    if (r._id === post?.original_post?._id) {
                                        r.reposts.splice(index, 1)
                                    }
                                })
                            }
                        }
                    }
                }
            }
        } else {

            const reply = state.post
            const replies = state.replies.data

            const index = reply.is_repost ? reply.original_post.reposts.indexOf(userId) : reply.reposts.indexOf(userId)

            if (index === -1) {

                if (reply.is_repost) {
                    reply.original_post.reposts.push(userId)
                } else {
                    reply.reposts.push(userId)
                }

                if (replies.length) {
                    replies.map(r => {
                        if (r?.original_post?._id === replyId && r._id !== reply._id) {
                            r.original_post.reposts.push(userId)
                        }
                    })
                }

                if (reply.is_reply) {
                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts

                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === replyId && p?._id !== reply?.originalRepostId) {
                                p.original_post.reposts.push(userId)
                            }
                        })

                        if (reply?.originalRepostId) {
                            const _index = state.repliesStore.findIndex(r => r?.original_post?._id === reply?.original_post?._id)

                            if (_index === -1) return
                            const _item = state.repliesStore[_index]
                            if (_item.replies.data.length) {
                                _item.replies.data.map(r => {
                                    if (r._id === reply._id) {
                                        r.reposts.push(userId)
                                    }
                                })
                            }
                        }
                    }
                }
            } else {
                if (reply.is_repost) {
                    reply.original_post.reposts.splice(index, 1)
                } else {
                    reply.reposts.splice(index, 1)
                }

                if (replies.length) {
                    replies.map(r => {
                        if (r?.original_post?._id === replyId && r._id !== replyId) {
                            r.original_post.reposts.splice(index, 1)
                        }
                    })
                }
                if (reply.is_reply) {

                    const module = state.posts.find(m => m.byId === postModule)
                    if (!module) return

                    const posts = module.posts

                    if (posts.length)
                        posts.map(p => {
                            if (p?.original_post?._id === replyId && p?._id !== reply?.originalRepostId) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        })
                    if (reply?.originalRepostId) {
                        const _index = state.repliesStore.findIndex(r => r?.original_post?._id === reply?.original_post?._id)

                        if (_index === -1) return
                        const _item = state.repliesStore[_index]
                        if (_item.replies.data.length) {
                            _item.replies.data.map(r => {
                                if (r._id === reply._id) {
                                    r.reposts.splice(index, 1)
                                }
                            })
                        }
                    }
                }
            }
        }
    },

    REPLACE_REPLIES_STORE(state, { originalPostId }) {
        console.log(originalPostId)
    }
};

