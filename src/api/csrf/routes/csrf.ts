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
    {
        method: "GET",
        path: "/verify-token",
        handler: "csrf.verifyToken",
        config: {
          auth: false,
        },
      },
  ],
};
