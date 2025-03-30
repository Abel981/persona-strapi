import { RateLimit } from "koa2-ratelimit";
import type { Core } from "@strapi/strapi";
import { Context, Next } from "koa";

export default (_config: any, {}: { strapi: Core.Strapi }) => {
  return async (ctx: Context, next: Next) => {
    return RateLimit.middleware({
      interval: { min: 15 },
      max: 10,
      message: "Too many requests, please slow down.",
      headers: true,
    })(ctx, next);
  };
};
