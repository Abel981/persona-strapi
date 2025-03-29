import { csrfUtils } from "../../../../utils/csrf";

export default {
  generateToken: async (ctx) => {
    try {
      // Generate new CSRF token
      const token = csrfUtils.generateToken();

      // Set token in cookie
      // ctx.cookies.set("XSRF-TOKEN", token, {
      //   httpOnly: false,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: process.env.NODE_ENV === "development" ? "None" : "Lax",
      //   path: "/",
      // });

      return { token };
    } catch (error) {
      console.error("CSRF Token Generation Error:", error);
      throw error;
    }
  },

  verifyToken: async (token) => {
    return csrfUtils.verifyToken(token);
  },
};
