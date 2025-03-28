// export default {
//   async afterCreate(event) {
//     console.log("Blog afterCreate hook triggered");
//     await handleBlogNotification(event);
//   },

//   async afterUpdate(event) {
//     console.log("Blog afterUpdate hook triggered");
//     await handleBlogNotification(event);
//   },
// };
// async function handleBlogNotification(event) {
//   const { result } = event;

//   // Check if the blog is published and hasn't sent notifications yet
//   if (result.publishedAt && !result.notificationsSent) {
//     try {
//       const subscribers = await strapi.entityService.findMany(
//         "api::subscriber.subscriber"
//       );

//       if (subscribers.length > 0) {
//         await strapi
//           .service("api::email.email")
//           .sendBlogNotificationInBatches(result, subscribers);

//     //

//       }
//     } catch (error) {
//       console.error("Error sending blog notifications:", error);
//     }
//   }
// }
