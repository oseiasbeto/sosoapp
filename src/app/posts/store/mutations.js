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

    ADD_NEW_POST(state, newPost) {
        state.posts.data = [newPost, ...(Array.isArray(state.posts.data) ? state.posts.data : [])]
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

    ADD_REPLY_FROM_REPLIES(state, newReply) {

        const replies = state.replies
        replies.data = [
            newReply,
            ...replies.data
        ]
    },

    ADD_REPLY_FROM_REPLIES_STORE(state, { index, newReply }) {

        if (index === -1 || !state.repliesStore || !state.repliesStore[index]) return;
        const repliesStore = state.repliesStore
        const item = state.repliesStore[index];

        console.log(item)


        if (item?.replies && newReply) {
            item.replies.data = [
                newReply,
                ...item.replies.data
            ]
        }

        if (newReply?.original_post?.is_reply && newReply?.original_post?.reposts.length) {
            console.log("aki")
            if (repliesStore.length) {
                const indexStore = repliesStore.findIndex(r => r.original_post._id === newReply?.original_post?._id)

                if (indexStore === -1) return

                const itemTwo = repliesStore[indexStore]

                itemTwo.replies.data = [
                    newReply,
                    ...itemTwo.replies.data
                ]
            }
        }
    },

    INC_REPLIES_COUNT_FROM_POSTS(state, { index, newReplyId }) {
        if (index === -1 || !state.posts || !state.posts.data[index]) return;
        const item = state.posts.data[index];

        if (!item.is_repost) {
            item.replies.push(newReplyId)
            if (item.reposts) {
                const posts = state.posts.data
                posts.map(p => {
                    if (p?.original_post?._id === item._id) {
                        p.original_post.replies.push(newReplyId)
                    }
                })
            }
        } else {
            item.original_post.replies.push(newReplyId)
            if (item.original_post.reposts) {
                const posts = state.posts.data
                posts.map(p => {
                    if (p?.original_post?._id === item.original_post._id && p._id !== item._id) {
                        p.original_post.replies.push(newReplyId)
                    }
                })
            }

            const repliesStore = state.repliesStore
            const indexStore = repliesStore.findIndex(r => r.original_post._id === item.original_post.original_post._id)

            if (indexStore === -1) return

            const replies = repliesStore[indexStore].replies.data

            if (replies.length) {
                replies.map(r => {
                    if (r._id === item?.original_post?._id) {
                        r.replies.push(newReplyId)
                    }
                })
            }
        }
    },

    INC_REPLIES_COUNT_FROM_REPLIES(state, { index, newReplyId }) {
        if (index === -1 || !state.replies || !state.replies.data[index]) return;

        const item = state.replies.data[index];
        const posts = state.posts.data

        item.replies.push(newReplyId)

        if (!item.original_post.is_repost) {
            item.original_post.replies.push(newReplyId)

            if (posts.length) {
                posts.map(p => {
                    if (p?.original_post?.original_post?._id === item?.original_post?._id) {
                        p.original_post.replies.push(newReplyId)
                    }
                })
            }
        } else {
            item.original_post.original_post.replies.push(newReplyId)

            if (posts.length) {
                posts.map(p => {
                    if (p?.original_post?._id !== item.original_post.original_post._id) {
                        if (p.original_post) {
                            p.original_post.replies.push(newReplyId)
                        } else {
                            p.replies.push(newReplyId)
                        }
                    }
                })
            }
        }
    },

    INC_REPLIES_COUNT_FROM_REPLIES_STORE(state, { index, newReplyId }) {

        if (index === -1 || !state.repliesStore || !state.repliesStore[index]) return;
        const item = state.repliesStore[index];

        const posts = state.posts.data

        if (!item.original_post.is_repost) {
            item.original_post.replies.push(newReplyId)
            if (posts.length && item.original_post.reposts.length) {
                posts.map(p => {
                    if (p?.original_post && p.original_post._id === item.original_post._id) {
                        p.original_post.replies.push(newReplyId)
                    }
                })
            }
        } else {

            item.original_post.original_post.replies.push(newReplyId)

            if (posts.length && item.original_post.original_post.reposts.length) {
                posts.map(p => {
                    if (p?.original_post?._id === item.original_post.original_post._id && p._id !== item.original_post._id) {
                        p.original_post.replies.push(newReplyId)
                    }

                    if (p._id === item.original_post.original_post._id) {
                        p.replies.push(newReplyId)
                    }
                })
            }
        }
    },

    TOGGLE_LIKE_POST(state, { postId, userId, isRepost, originalRepostId }) {
        if (!isRepost) {
            const post = state.posts.data.find(p => p._id === postId);
            const posts = state.posts.data

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
            const post = state.posts.data.find(p => p._id === originalRepostId);
            const posts = state.posts.data
            const repliesStore = state.repliesStore

            if (!post) return;

            const index = post.original_post.likes.indexOf(userId);

            if (index === -1) {
                post.original_post.likes.push(userId);

                if (post.original_post.reposts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === post?.original_post?._id && p._id !== post._id) {
                            p.original_post.likes.push(userId)
                        }
                    })
                }


                if (repliesStore.length) {
                    const indexStore = repliesStore.findIndex(r => r.original_post._id === post.original_post.original_post._id)

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
                    })
                }

                if (repliesStore.length) {
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

    TOGGLE_LIKE_REPLY(state, { replyId, userId, isOriginalPost }) {
        const reply = state.replies.data.find(r => r._id === replyId);
        const post = state.post


        if (!reply && !isOriginalPost) return;

        if (isOriginalPost) {

            if (!post.is_repost) {
                const posts = state.posts.data

                const index = post.likes.indexOf(userId);
                if (index === -1) {
                    post.likes.push(userId)
                    if (posts.length && post.replies.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === post._id) {
                                p.original_post.likes.push(userId)
                            }
                        })
                    }
                } else {
                    post.likes.splice(index, 1);
                    if (posts.length && post.replies.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === post._id) {
                                p.original_post.likes.splice(index, 1)
                            }
                        })
                    }
                }
            } else {
                const index = post.original_post.likes.indexOf(userId);
                const posts = state.posts.data

                if (index === -1) {
                    post.original_post.likes.push(userId)
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === post.original_post._id && p._id !== post._id || p?._id === post.original_post._id) {
                                if (p?._id !== post.original_post._id) {
                                    p.original_post.likes.push(userId)
                                } else {
                                    p.likes.push(userId)
                                }
                            }
                        })
                    }
                } else {
                    post.original_post.likes.splice(index, 1);
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === post.original_post._id && p._id !== post._id || p?._id === post.original_post._id) {
                                if (p?._id !== post.original_post._id) {
                                    p.original_post.likes.splice(index, 1)
                                } else {
                                    p.likes.splice(index, 1)
                                }
                            }
                        })
                    }
                }
            }
        } else {
            const index = reply.likes.indexOf(userId);
            const posts = state.posts.data

            if (index === -1) {
                reply.likes.push(userId);
                if (posts.length) {
                    posts.map(p => {
                        if (p?.original_post?._id === reply._id) {
                            p.original_post.likes.push(userId)
                        }
                    })
                }
            } else {
                reply.likes.splice(index, 1);
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

    TOGGLE_REPOST_POST(state, { postId, isViewPage, userId }) {
        if (!isViewPage) {
            const post = state.posts.data.find(p => p._id === postId);
            const posts = state.posts.data

            if (!post) return;

            const index = post.reposts.indexOf(userId)
                ;
            if (index === -1) {
                post.reposts.push(userId);

                if (posts.length && post.reposts.length) {
                    posts.map(p => {
                        if (post._id === p?.original_post?._id) {
                            p.original_post.reposts.push(userId)
                        }
                    })
                }
            } else {
                post.reposts.splice(index, 1);

                if (posts.length) {
                    /* 
                    const index = posts.findIndex(p => p.is_repost && p.author._id === userId && p?.original_post._id === postId)

                    if (index !== -1) {
                        posts.splice(index, 1)
                    }*/

                    posts.map(p => {
                        if (p?.original_post?._id === post._id) {
                            const index = p.original_post.reposts.indexOf(userId)

                            if (index !== -1) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        }
                    })
                }
            }
        } else {
            const post = state.post
            const posts = state.posts.data

            if (!post.is_repost) {
                const index = post.reposts.indexOf(userId)


                if (index === -1) {
                    post.reposts.push(userId)
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === postId && p._id !== post._id) {
                                p.original_post.reposts.push(userId)
                            }
                        })
                    }
                } else {
                    post.reposts.splice(index, 1);
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === postId) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        })
                        /* 
                        const i = posts.findIndex(p => p.is_repost && p.author._id === userId && p?.original_post._id === postId)
                        if (i !== -1) {
                            posts.splice(index, 1)
                        }*/
                    }
                }
            } else {
                const index = post.original_post.reposts.indexOf(userId)


                if (index === -1) {
                    post.original_post.reposts.push(userId);

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
                    if (posts.length) {
                        const i = posts.findIndex(p => p.is_repost && p.author._id === userId && p?.original_post._id === postId)

                        if (i !== -1) {
                            posts.splice(i, 1)
                        }

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

                    post.original_post.reposts.splice(index, 1);
                }
            }
        }
    },

    TOGGLE_REPOST_REPLY(state, { replyId, isViewPage, isPost, userId }) {
        if (!isViewPage) {

            if (!isPost) {
                const reply = state.replies.data.find(r => r._id === replyId);
                const posts = state.posts.data


                const index = reply.reposts.indexOf(userId)
                if (index === -1) {
                    reply.reposts.push(userId)
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === reply._id) {
                                p.original_post.reposts.push(userId)
                            }
                        })
                    }
                } else {
                    reply.reposts.splice(index, 1);
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === reply._id) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        })
                    }
                }
            } else {
                const posts = state.posts.data
                const post = state.posts.data.find(p => p?.original_post?._id === replyId);

                if (!post) return

                const originalPost = post.original_post

                const index = originalPost.reposts.indexOf(userId)

                if (index === -1) {
                    if (posts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === originalPost._id) {
                                p.original_post.reposts.push(userId)
                            }
                        })
                    }
                } else {
                    if (originalPost.reposts.length) {
                        posts.map(p => {
                            if (p?.original_post?._id === originalPost._id) {
                                p.original_post.reposts.splice(index, 1)
                            }
                        })
                    }
                }
            }
        } else {

            const reply = state.post
            const replies = state.replies.data
            const posts = state.posts.data

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
                if (posts.length && reply.is_reply) {
                    posts.map(p => {
                        if (p?.original_post?._id === replyId && p._id !== reply._id) {
                            p.original_post.reposts.push(userId)
                        }
                    })
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
                if (posts.length && reply.is_reply) {
                    posts.map(p => {
                        if (p?.original_post?._id === replyId) {
                            p.original_post.reposts.splice(index, 1)
                        }
                    })
                }
            }
        }
    },
    
    REPLACE_REPLIES_STORE(state, { originalPostId }) {
        console.log(originalPostId)
    }
};