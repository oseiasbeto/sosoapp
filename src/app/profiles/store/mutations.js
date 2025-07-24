export default {
  SET_PROFILE(state, profile) {
    state.profile = profile;
  },
  ADD_NEW_PROFILE_FROM_PROFILES(state, newProfile) {
    const profileExisists = state.profiles.findIndex((p) => p?._id === newProfile?._id);
    const profiles = state.profiles;

    if (profileExisists === -1) {
        profiles.push(newProfile)
    } else return
  },
  UPDATE_FOLLOW_STATE(state, { userId, profileId, isFollowing, isFollowedBy }) {
    if (state.user?._id === userId) {
      // Atualiza following do usuário
      if (isFollowing) {
        if (!state.user.following.includes(profileId)) {
          state.user.following.push(profileId);
        }
      } else {
        state.user.following = state.user.following.filter(
          (id) => id !== profileId
        );
      }

      // Atualiza followers do usuário, se necessário
      if (isFollowedBy) {
        if (!state.user.followers.includes(profileId)) {
          state.user.followers.push(profileId);
        }
      } else {
        state.user.followers = state.user.followers.filter(
          (id) => id !== profileId
        );
      }

      // Atualiza followers do perfil
      if (state.profile?._id === profileId) {
        if (isFollowing) {
          if (!state.profile.followers.includes(userId)) {
            state.profile.followers.push(userId);
          }
        } else {
          state.profile.followers = state.profile.followers.filter(
            (id) => id !== userId
          );
        }
      }
    }
  },
};
