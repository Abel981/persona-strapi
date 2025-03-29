import { csrfUtils } from "../../../../utils/csrf";

export default {
  generateToken: async (ctx) => {
    try {
      // Generate new CSRF token
      const token = csrfUtils.generateToken();

      // Set token in cookie
      ctx.cookies.set('XSRF-TOKEN', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return { token };
    } catch (error) {
      console.error('CSRF Token Generation Error:', error);
      throw error;
    }
  },

  verifyToken: async (token) => {
    return csrfUtils.verifyToken(token);
  }
};