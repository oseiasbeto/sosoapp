export default [
  {
    path: "/post/media/:media_id",
    name: "Media preview",
    meta: {
      requiresAuth: true,
      rootPage: "media",
      title: "1Kole - Media",
    },
    component: () => import("./views/MediaPreview.vue"),
  }
];
