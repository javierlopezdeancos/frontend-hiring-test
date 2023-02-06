import { TOKEN_EXPIRED_URL_PARAM } from './token';

export const USER_LOGIN_ROUTE = '/login';

export const USER_EXPIRED_SESSION_REDIRECTION_ROUTE = `${USER_LOGIN_ROUTE}?${TOKEN_EXPIRED_URL_PARAM}=true`;
