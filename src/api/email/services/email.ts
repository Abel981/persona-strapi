export default {
  async sendBlogNotification(blog, subscriber) {
    try {
      // Validate required fields
      if (!blog.title || !subscriber.email) {
        throw new Error("Missing required fields for email");
      }

      const blogUrl = `${process.env.FRONTEND_URL}/blog/${blog.documentId}`;

      // Format the from address properly
      const fromAddress = `Blog Newsletter <${process.env.MAILGUN_FROM_EMAIL}>`;

      // Ensure text version is provided alongside HTML
      const textContent = `
        New Blog Post Published!
        ${blog.title}
        ${blog.excerpt || blog.description || ""}
        Read More: ${blogUrl}
        ---
       
      `;

      const email = await strapi.plugins["email"].services.email.send({
        to: "abel.wen0@gmail.com",
        from: fromAddress,
        subject: `New Blog Post: ${blog.title}`,
        text: "This is a test email.",
      });

      console.log(`Email sent successfully to ${subscriber.email}`);
      return email;
    } catch (error) {
      console.error("Email sending error:", {
        error: error.message,
        subscriber: subscriber.email,
        blog: blog.title,
      });
      throw error;
    }
  },

  async sendBlogNotificationInBatches(documentId, subscribers, batchSize = 50) {
    // Check if the document type and action are valid for sending email notifications
    const blog = await strapi.documents("api::blog.blog").findOne({
      documentId: documentId,
    });
    const batches = [];
    console.log("this is the sendBlogNotificationInBatches function");
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map((subscriber) => this.sendBlogNotification(blog, subscriber))
      );
      // Wait between batches to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  },
};
