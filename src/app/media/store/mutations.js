export default {
  SET_MEDIA(state, media) {
    const { type, index, items } = media;
    state.media = {
      type,
      index,
      items,
    };
  },
};
