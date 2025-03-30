/**
 * subscriber router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::subscriber.subscriber", {
  only: ["find", "findOne", "create", "update", "delete"],

  config: {
    create: {
      middlewares: ["api::subscriber.rate-limit"],
    },
  },
});
