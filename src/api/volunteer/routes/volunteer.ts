/**
 * volunteer router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::volunteer.volunteer", {
  config: {
    create: {
      middlewares: ["api::volunteer.rate-limit"],
    },
  },
});
