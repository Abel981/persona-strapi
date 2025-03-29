import csrfService from "../../src/api/csrf/services/csrf";
export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (
      ["GET", "HEAD", "OPTIONS"].includes(ctx.method) ||
      ctx.path === "/api/csrf-token"
    ) {
      return await next();
    }

    try {
      await csrfService.verifyToken(ctx);
    } catch (error) {
      return ctx.forbidden("Invalid CSRF token");
    }
  };
};
