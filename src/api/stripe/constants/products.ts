export const STRIPE_PRODUCTS = {
  CAMPAIGN: {
    type: "campaign",
    getName: (title: string) => `${title}`,
  },

  MEMBERSHIP: {
    type: "membership",
    getName: (tier: string) => `${tier} `,
  },
  // Add more product types as needed
} as const;

// Type for product types
export type StripeProductType = keyof typeof STRIPE_PRODUCTS;
