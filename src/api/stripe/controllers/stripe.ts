import { Context } from "koa";
import stripeService from "../services/stripe";
export default {
  async createOneTimePayment(ctx: Context) {
    try {
      const { amount, title, productType, metadata, uniqueId } =
        ctx.request.body;
      if (!amount || amount <= 0 || !title || !productType || !uniqueId) {
        return ctx.badRequest(
          "Invalid amount, title, product type or unique id"
        );
      }

      let session = await stripeService.createOneTimePayment({
        amount,
        title,
        productType,
        uniqueId,
        metadata,
      });
      return ctx.send({
        ["sessionId"]: session.id,
      });
    } catch (error) {
      ctx.body = {
        error: "An error occurred while crearing one time payment",

        details: error instanceof Error ? error.message : "Unknown error",
      };

      ctx.status = 500;
    }
  },
  async createSubscription(ctx: Context) {
    if (!ctx.request.body) {
      return ctx.badRequest("no body found");
    }
    const { amount, title, productType, metadata, interval, uniqueId } =
      ctx.request.body;

    try {
      if (!amount || amount <= 0 || !title || !productType || !uniqueId) {
        return ctx.badRequest(
          "Invalid amount, title, product type or unique id"
        );
      }

      if (!["month", "year"].includes(interval)) {
        return ctx.badRequest("Invalid subscription interval");
      }

      let session = await stripeService.createSubscription({
        amount,
        title,
        productType,
        uniqueId,
        metadata,
        interval,
      });

      return ctx.send({
        ["sessionId"]: session.id,
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async handleWebhook(ctx: Context) {
    try {
      const signature = ctx.request.headers["stripe-signature"] as string;
      let unparsed = Symbol.for("unparsedBody");
      const rawBody = ctx.request.body[unparsed];


      await stripeService.handleWebhookEvent(signature, rawBody);
      ctx.body = { received: true };
    } catch (error) {
      console.error("Webhook error:", error);
      ctx.throw(400, error.message);
    }
  },
};
