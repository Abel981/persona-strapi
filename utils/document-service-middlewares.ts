import emailService from "../src/api/email/services/email";
const pageTypes = ["api::blog.blog"];
const sendEmailActions = ["publish"];
const emailNotificationMiddleware = () => {
  return async (context, next) => {
    // console.log("emailNotificationMiddleware");
    // console.log("c", context.uid);
    // console.log("ca", context.action);
    // console.log("cd", context.document);
    // console.log("cp", context.params);
    // console.log("cont", JSON.stringify(context));
    // // Check if the document type and action are valid for sending email notifications
    // console.log("pagetypebool", pageTypes.includes(context.uid));
    // console.log("sendemailbool", sendEmailActions.includes(context.action));
    if (
      pageTypes.includes(context.uid) &&
      sendEmailActions.includes(context.action)
    ) {
      /// TODO: Implement email notification
      // const subscribers = await strapi
      //   .documents("api::subscriber.subscriber")
      //   .findMany();
      // await emailService.sendBlogNotificationInBatches(
      //   context.params.documentId,
      //   subscribers
      // ); // Notify the author via email
    }

    return await next(); // Call the next middleware in the stack
  };
};

export { emailNotificationMiddleware };
