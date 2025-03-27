import { Stripe } from "stripe";

const config = {
  stripePublishableKey: process.env.STRIPE_PUBLIC_KEY,
  stripePrivateKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};

const stripe = new Stripe(config.stripePrivateKey);

export default (() => {
  // ======================
  // PRIVATE HELPERS (closure-scoped)
  // ======================
  const updateCampaignAmount = async (campaignId: string, amount: number) => {
    try {
      const campaign = await strapi
        .documents("api::campaign.campaign")
        .findOne({
          documentId: campaignId,
        });

      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

      await strapi.documents("api::campaign.campaign").update({
        documentId: campaignId,
        data: {
          amountRaised: campaign.amountRaised + amount,
        },
        status: "published",
      });
    } catch (error) {
      strapi.log.error(`Campaign update failed: ${error.message}`);
      throw error;
    }
  };

  const handleCheckoutSession = async (session: any) => {
    await updateCampaignAmount(
      session.metadata.campaignId,
      (session.amount_total || 0) / 100
    );
  };

  const handleSubscriptionCreated = async (subscription: any) => {
    await updateCampaignAmount(
      subscription.metadata.campaignId,
      (subscription.items.data[0].price.unit_amount || 0) / 100
    );
  };

  const handleSubscriptionUpdated = async (event: any) => {
    const { previous_attributes, object: subscription } = event.data;
    if (
      previous_attributes?.current_period_end !==
      subscription.current_period_end
    ) {
      await updateCampaignAmount(
        subscription.metadata.campaignId,
        (subscription.items.data[0].price.unit_amount || 0) / 100
      );
    }
  };

  // ======================
  // PUBLIC API
  // ======================
  return {
    async createOneTimePayment({ amount, campaignId, metadata }) {
      try {
        const existingProducts = await stripe.products.search({
          query: `active:'true' AND metadata['campaign_id']:'${campaignId}'`,
        });

        const product =
          existingProducts.data.length > 0
            ? existingProducts.data[0]
            : await stripe.products.create({
                name: `Donation to ${campaignId}`,
                metadata: { campaignId },
              });

        return await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product: product.id,
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          metadata: { ...metadata, campaignId, amount },
          success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });
      } catch (error) {
        throw new Error(`Payment creation failed: ${error.message}`);
      }
    },

    async createSubscription({ amount, campaignId, interval, metadata }) {
      try {
        const existingProducts = await stripe.products.search({
          query: `active:'true' AND metadata['campaign_id']:'${campaignId}'`,
        });

        const product =
          existingProducts.data.length > 0
            ? existingProducts.data[0]
            : await stripe.products.create({
                name: `Donation to ${campaignId} (Recurring)`,
                metadata: { campaignId },
              });

        const price = await stripe.prices.create({
          unit_amount: Math.round(amount * 100),
          currency: "usd",
          recurring: { interval },
          product: product.id,
        });

        return await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: price.id, quantity: 1 }],
          metadata: { ...metadata, campaignId, amount, interval },
          success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });
      } catch (error) {
        throw new Error(`Subscription creation failed: ${error.message}`);
      }
    },

    async handleWebhookEvent(signature: string, payload: Buffer) {
      try {
        const event = stripe.webhooks.constructEvent(
          payload,
          signature,
          config.webhookSecret
        );

        switch (event.type) {
          case "checkout.session.completed":
            await handleCheckoutSession(event.data.object);
            break;
          case "customer.subscription.created":
            await handleSubscriptionCreated(event.data.object);
            break;
          case "customer.subscription.updated":
            await handleSubscriptionUpdated(event);
            break;
          default:
            strapi.log.debug(`Unhandled event: ${event.type}`);
        }
      } catch (error) {
        strapi.log.error(`Webhook failed: ${error.message}`);
        throw error;
      }
    },
  };
})();
