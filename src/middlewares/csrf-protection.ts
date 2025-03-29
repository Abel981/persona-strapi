import csrfService from "../../src/api/csrf/services/csrf";
export default (config, { strapi }) => {
  return async (ctx, next) => {
    console.log("ctx.path", ctx.path);
    if (
      ["GET", "HEAD", "OPTIONS"].includes(ctx.request.method) ||
      ctx.path === "/api/csrf-token" ||
      (ctx.path as string).startsWith("/admin") ||
      (ctx.path as string).startsWith("/content-manager")
    ) {
      return await next();
    }

    try {
      // const csrfToken = ctx.request.headers["x-csrf-token"];

      // if (!csrfToken) {
      //   return ctx.forbidden("Invalid CSRF token");
      // }

      // const isValid = await csrfService.verifyToken(csrfToken);
      // if (!isValid) {
      //   return ctx.forbidden("Invalid CSRF token");
      // }
    } catch (error) {
      return ctx.forbidden("Invalid CSRF token");
    }
    await next();
  };
};
