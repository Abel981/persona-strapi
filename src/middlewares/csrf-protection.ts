import csrfService from "../../src/api/csrf/services/csrf";
export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (
      ["GET", "HEAD", "OPTIONS"].includes(ctx.request.method) ||
      ctx.path === "/api/csrf-token"
    ) {
      return await next();
    }

    try {
      const csrfToken = ctx.request.headers["x-csrf-token"];

      if (!csrfToken) {
        return ctx.forbidden("Invalid CSRF token");
      }

      const isValid = await csrfService.verifyToken(csrfToken);
      if (!isValid) {
        return ctx.forbidden("Invalid CSRF token");
      }
    } catch (error) {
      return ctx.forbidden("Invalid CSRF token");
    }
    await next();
  };
};
