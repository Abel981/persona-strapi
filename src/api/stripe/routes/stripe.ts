export default {
  routes: [

    {
      method: "POST",
      path: "/stripe/create-onetime-payment",
      handler: "stripe.createOneTimePayment",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/stripe/create-subscription",
      handler: "stripe.createSubscription",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
      {
        method: 'POST',
        path: '/stripe/webhook',
        handler: 'stripe.handleWebhook',
        config: {
          auth: false,
          policies: [],
          middlewares: [],
        },
      },
    // {
    //   method: "GET",
    //   path: "/stripe/session/:sessionId",
    //   handler: "stripe.getSession",
    //   config: {
    //     auth: false,
    //     policies: [],
    //     middlewares: [],
    //   },
    // },
  ],
};

