import csrfService from "../../src/api/csrf/services/csrf";
export default (config, { strapi }) => {
  return async (ctx, next) => {
    console.log("ctx.path", ctx.path);
    if (
      ["POST", "PUT", "PATCH"].includes(ctx.request.method) &&
      ["/api/volunteer"].includes(ctx.path)
    ) {
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
    }
    return await next();
  };
};
