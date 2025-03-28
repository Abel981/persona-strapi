export default ({ env }) => ({
  email: {
    config: {
      provider: "mailgun",
      providerOptions: {
        key: env("MAILGUN_API_KEY"),
        domain: env("MAILGUN_DOMAIN"), // Required if you use the European region
        url: env("MAILGUN_URL", "https://api.mailgun.net"), // Optional
      },
      // settings: {
      //   defaultFrom: env("MAILGUN_FROM_EMAIL", "your-verified@domain.com"),
      //   defaultReplyTo: env("MAILGUN_REPLY_TO", "your-verified@domain.com"),
      // },
    },
  },
});
