import Tokens from "csrf";

const tokens = new Tokens();
const secret = process.env.CSRF_SECRET || tokens.secretSync();

export const csrfUtils = {
  generateToken: () => tokens.create(secret),
  verifyToken: (token: string) => tokens.verify(secret, token),
};
