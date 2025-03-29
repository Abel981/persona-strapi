export default {
  routes: [
    {
      method: "GET",
      path: "/csrf-token",
      handler: "csrf.getToken",
      config: {
        auth: false,
      },
    },
  ],
};
