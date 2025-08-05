export default {
  SET_USER(state, user) {
    state.user = user;
  },

  CLEAR_USER(state) {
    state.user = null;
  },

  SET_PROFILE(state, profile) {
    state.profile = profile;

    const profileExisistsIndex = state.profiles.findIndex(
      (p) => p?._id === profile?._id
    );

    if (profileExisistsIndex === -1) {
      state.profiles[profileExisistsIndex] = profile;
    }
  },

  ADD_NEW_PROFILE_FROM_PROFILES(state, newProfile) {
    const profileExisists = state.profiles.findIndex(
      (p) => p?._id === newProfile?._id
    );
    const profiles = state.profiles;

    if (profileExisists === -1) {
      profiles.push(newProfile);
    } else return;
  },

  SET_TAB_FROM_PROFILE(state, { byId, tab }) {
    if (!state.profiles) return;

    const index = state.profiles.findIndex((p) => p?._id === byId);

    if (index !== -1) {
      const item = state.profiles[index];

      item.tab = tab;
    }
  },

  SET_SCROLLTOP_FROM_PROFILE(state, { byId, scrollTop }) {
    if (!state.profiles) return;

    const index = state.profiles.findIndex((p) => p?._id === byId);

    if (index !== -1) {
      const item = state.profiles[index];
      item.scroll_top = scrollTop;
    }
  },

  TOGGLE_FOLLOWING(state, profileId) {
    if (!state.user) return;  
    if (!state.user.following.includes(profileId)) {
      state.user.following.push(profileId);
      state.user.following_count = state.user.following_count + 1;
    } else {
      state.user.following = state.user.following.filter(followingId => followingId !== profileId);
      state.user.following_count = state.user.following_count - 1; 
    }
  },

  UPDATE_FOLLOW_STATE(state, { userId, profileId, isFollowing, isFollowedBy }) {
    if (state?.user?._id === userId) {
      // Atualiza following do usuário
      if (isFollowing) {
        if (!state.user.following.includes(profileId)) {
          state.user.following.push(profileId);
          state.user.following_count = state.user.following_count + 1;
        }
      } else {
        state.user.following = state.user.following.filter(
          (id) => id !== profileId
        );
        state.user.following_count = state.user.following_count - 1;
      }

      // Atualiza followers do perfil
      if (state.profile?._id === profileId) {
        if (isFollowing) {
          if (!state.profile.followers.includes(userId)) {
            state.profile.followers.push(userId);
            state.profile.followers_count = state.profile.followers_count + 1;
          }
        } else {
          if (state?.profile?.followers?.length) {
            state.profile.followers = state.profile.followers.filter(
              (id) => id !== userId
            );
            state.profile.followers_count = state.profile.followers_count - 1;
          }
        }
      }
    }
  },
};
