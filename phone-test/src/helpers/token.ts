import { TOKEN_EXPIRATION_MINUTES } from '../constants/token';

export const getTokenExpiration = (): Date =>
  new Date(new Date().getTime() + TOKEN_EXPIRATION_MINUTES * 60000);
