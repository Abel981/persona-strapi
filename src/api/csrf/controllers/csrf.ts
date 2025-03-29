export default {
  async getToken(ctx) {
    try {
      const { token } = await strapi
        .service("api::csrf.csrf")
        .generateToken(ctx);

      return {
        data: {
          csrfToken: token,
        },
      };
    } catch (error) {
      console.error("CSRF Token Generation Error:", error);
      return ctx.badRequest("Failed to generate CSRF token");
    }
  },

  async verifyToken(ctx) {
    try {
      const token =
        ctx.request.header["x-csrf-token"] || ctx.cookies.get("XSRF-TOKEN");

      if (!token) {
        return ctx.forbidden("CSRF token missing");
      }

      const isValid = await strapi.service("api::csrf.csrf").verifyToken(token);

      if (!isValid) {
        return ctx.forbidden("Invalid CSRF token");
      }

      // Token is valid, continue
      return ctx.next();
    } catch (error) {
      console.error("CSRF Token Verification Error:", error);
      return ctx.forbidden("Invalid CSRF token");
    }
  },
};
