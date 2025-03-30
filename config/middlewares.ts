export default [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      origin: [process.env.FRONTEND_URL], // Your Next.js frontend URL
      headers: [
        "Content-Type",
        "Authorization",
        "X-CSRF-TOKEN", // Add this line
        "X-Requested-With",
      ],
      credentials: true, // Required for cookies
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      includeUnparsed: true,
    },
  },
  "global::csrf-protection",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
