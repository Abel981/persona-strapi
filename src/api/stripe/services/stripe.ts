import { Stripe } from "stripe";
import { STRIPE_PRODUCTS, StripeProductType } from "../constants/products";
import emailService from "../../email/services/email";
import PaymentConfirmationEmail from "../../email/services/templates/PaymentConfirmation";
import React from "react";
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
  interface PaymentParams {
    amount: number;
    title: string;
    productType: StripeProductType;
    uniqueId: string; // For identifying specific campaign, course, etc.
    metadata: Record<string, any>;
  }

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

  const createDonation = async (metaData) => {
    await strapi.db.transaction(
      async ({ trx, rollback, commit, onCommit, onRollback }) => {
        // It will implicitly use the transaction
        const donor = await strapi.documents("api::donor.donor").create({
          data: {
            firstName: metaData.firstName,
            lastName: metaData.lastName,
            email: metaData.email,
            address: metaData.address,
            ...(metaData.product_type === "campaign"
              ? {
                  campaign: {
                    connect: [metaData.unique_id],
                  },
                }
              : {}),
          },

          status: "published",
        });
        await strapi.documents("api::donation.donation").create({
          data: {
            amount: metaData.amount,
            currency: metaData.currency,
            donor: donor.documentId,
            interval: metaData.interval,
            subscribeToUpdates: metaData.emailReports,
            ...(metaData.product_type === "campaign"
              ? { campaign: metaData["unique_id"] }
              : {}),
            message: metaData.message,
          },
          status: "published",
        });
      }
    );
  };

  const handleCheckoutSession = async (session: any) => {
    if (session.metadata.product_type === "campaign") {
      await updateCampaignAmount(
        session.metadata.unique_id,
        (session.amount_total || 0) / 100
      );
    }

    await createDonation(session.metadata);
    await emailService.sendEmail({
      to: [session.metadata.email],
      subject: "Thank you for your donation",
      react: React.createElement(PaymentConfirmationEmail, {
        amount: session.amount_total,
        currency: session.currency,
        email: session.metadata.email,
        firstName: session.metadata.firstName,
        lastName: session.metadata.lastName,
      }),
    });
  };

  // const handleSubscriptionCreated = async (subscription: any) => {
  //   if (subscription.metadata.campaignId !== undefined) {
  //     await updateCampaignAmount(
  //       subscription.metadata.unique_id,
  //       (subscription.items.data[0].price.unit_amount || 0) / 100
  //     );
  //   }
  //   await createDonation(subscription.metadata);
  // };

  // const handleSubscriptionUpdated = async (event: any) => {
  //   const { previous_attributes, object: subscription } = event.data;
  //   if (
  //     previous_attributes?.current_period_end !==
  //     subscription.current_period_end
  //   ) {
  //     await updateCampaignAmount(
  //       subscription.metadata.campaignId,
  //       (subscription.items.data[0].price.unit_amount || 0) / 100
  //     );
  //   }
  // };

  // ======================
  // PUBLIC API
  // ======================
  return {
    async createOneTimePayment({
      amount,
      title,
      productType,
      uniqueId,
      metadata,
    }: PaymentParams) {
      try {
        if (!STRIPE_PRODUCTS[productType]) {
          throw new Error(`Invalid product type: ${productType}`);
        }

        const productName = STRIPE_PRODUCTS[productType].getName(title);
        const productTypeValue = STRIPE_PRODUCTS[productType].type;

        const existingProducts = await stripe.products.search({
          query: `active:'true' AND metadata['product_type']:'${productTypeValue}' AND metadata['unique_id']:'${uniqueId}'`,
        });

        const product =
          existingProducts.data.length > 0
            ? existingProducts.data[0]
            : await stripe.products.create({
                name: productName,
                metadata: {
                  product_type: productTypeValue,
                  unique_id: uniqueId,
                },
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
          customer_email: metadata.email,
          metadata: {
            amount,
            product_type: productTypeValue,
            unique_id: uniqueId,
            ...metadata,
          },
          success_url: `${process.env.FRONTEND_URL}/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        });
      } catch (error) {
        console.log("error", error);
        throw new Error(`Payment creation failed: ${error.message}`);
      }
    },

    async createSubscription({
      amount,
      interval,
      title,
      productType,
      uniqueId,
      metadata,
    }) {
      try {
        if (!STRIPE_PRODUCTS[productType]) {
          throw new Error(`Invalid product type: ${productType}`);
        }
        const productName = STRIPE_PRODUCTS[productType].getName(title);
        const productTypeValue = STRIPE_PRODUCTS[productType].type;
        const existingProducts = await stripe.products.search({
          query: `active:'true' AND metadata['product_type']:'${productTypeValue}' AND metadata['unique_id']:'${uniqueId}'`,
        });

        const product =
          existingProducts.data.length > 0
            ? existingProducts.data[0]
            : await stripe.products.create({
                name: productName,
                metadata: {
                  product_type: productTypeValue,
                  unique_id: uniqueId,
                },
              });

        return await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product: product.id,
                unit_amount: Math.round(amount * 100),
                recurring: { interval },
              },
              quantity: 1,
            },
          ],
          customer_email: metadata.email,
          metadata: {
            ...metadata,
            unique_id: uniqueId,
            amount,
            interval,
            product_type: productTypeValue,
          },
          success_url: `${process.env.FRONTEND_URL}/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
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
          // case "customer.subscription.created":
          //   await handleSubscriptionCreated(event.data.object);
          //   break;
          // case "customer.subscription.updated":
          //   await handleSubscriptionUpdated(event);
          //   break;
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
