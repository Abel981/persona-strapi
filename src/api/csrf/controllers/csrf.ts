import csrfService from "../services/csrf";

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
      console.log("ctx.request.body", ctx.request.body);
      const token = "IEAmYjKy-S7yRpNtNkxv9tAvRn6G5DSGxfYo";

      if (!token) {
        return ctx.forbidden("CSRF token missing");
      }

      const isValid = await csrfService.verifyToken(token);

      if (!isValid) {
        return ctx.forbidden("Invalibhd CSRF token");
      }

      // Token is valid, continue
      return {
        data: {
          isValid: true,
        },
      };
    } catch (error) {
      console.error("CSRF Token Verification Error:", error);
      return ctx.forbidden("Invalid CSRF token");
    }
  },
};
