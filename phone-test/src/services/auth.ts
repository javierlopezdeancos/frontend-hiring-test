import { ApolloClient, InMemoryCache, createHttpLink, split, ApolloLink } from '@apollo/client';
import { print } from 'graphql';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { REFRESH_TOKEN } from '../gql/mutations/refreshToken';
import { getMainDefinition } from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { USER_EXPIRED_SESSION_REDIRECTION_ROUTE } from '../constants/user';
import { TokenStorageKey } from '../constants/token';
import { getTokenExpiration } from '../helpers/token';
import { NO_API_URL_SET_ERROR, NO_WEB_SOCKET_URL_SET_ERROR } from '../constants/env';
import { API_URL, WEB_SOCKET_URL } from '../constants/env';

import type { NormalizedCacheObject } from '@apollo/client';

// Check if token is expired, returns true if no token
const isTokenExpired = (): boolean => {
  const tokenExpiration = localStorage.getItem(TokenStorageKey.EXPIRATION);

  if (!tokenExpiration) {
    return true;
  }

  return new Date(JSON.parse(tokenExpiration ?? '')) > new Date();
};

const getRefreshToken = (): string => {
  const accessToken = localStorage.getItem(TokenStorageKey.REFRESH);
  const parsedToken = accessToken ? JSON.parse(accessToken) : undefined;

  return accessToken ? `Bearer ${parsedToken}` : '';
};

const onRefreshToken = async () => {
  const bodyString = print(REFRESH_TOKEN);

  let response;

  if (!API_URL) {
    throw new Error(NO_API_URL_SET_ERROR);
  }

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: getRefreshToken()
      },
      body: JSON.stringify({
        query: bodyString
      })
    });
  } catch (error) {
    throw new Error(`Error fetching a new fresh access token: ${error}`);
  }

  return await response.json();
};

const getRefreshTokenLink = (): ApolloLink => {
  // TokenRefreshLink handle events, after getting new token call the original request:
  const refreshLink = new TokenRefreshLink({
    accessTokenField: TokenStorageKey.ACCESS,
    // If the token is not yet expired or the user does not require a token (guest), then true should be returned
    // Check if token es expired
    isTokenValidOrUndefined: isTokenExpired,
    // Function covers fetch call with request fresh access token
    // Get the new token from backend
    fetchAccessToken: async () => await onRefreshToken(),
    // Callback which receives a fresh token from Response. From here we can save token to the storage
    // Save the new token on localStorage
    handleFetch: (access_token: unknown) => {
      localStorage.setItem(TokenStorageKey.ACCESS, JSON.stringify(access_token));
    },
    // Override internal function to manually parse and extract your token from server response
    // Format the endpoint response
    handleResponse: () => (response: any) => {
      if (!response) {
        return {
          access_token: null
        };
      }

      const expirationToken = getTokenExpiration();

      localStorage.setItem(TokenStorageKey.EXPIRATION, JSON.stringify(expirationToken));

      return {
        access_token: response.data.refreshTokenV2.access_token
      };
    },
    // Allows to run additional actions on error.
    handleError: (error: any) => {
      // TODO: probably here should be logout
      console.error('Cannot refresh access token:', error);
      localStorage.removeItem(TokenStorageKey.EXPIRATION);
      localStorage.removeItem(TokenStorageKey.ACCESS);
      localStorage.removeItem(TokenStorageKey.REFRESH);

      // redirect to login, refresh token has expired
      window.document.location.href = USER_EXPIRED_SESSION_REDIRECTION_ROUTE;
    }
  });

  return refreshLink;
};

//Call server to get the new access token using the refresh token
const getHttpLink = (): ApolloLink => {
  if (!API_URL) {
    throw new Error(NO_API_URL_SET_ERROR);
  }

  const httpLink = createHttpLink({
    uri: API_URL,
    fetch
  });

  return httpLink;
};

const getToken = () => {
  // Get the authentication token from local storage if it exists
  const accessToken = localStorage.getItem(TokenStorageKey.ACCESS);
  const parsedToken = accessToken ? JSON.parse(accessToken) : undefined;
  return accessToken ? `Bearer ${parsedToken}` : '';
};

const subscriptionMiddleware = {
  applyMiddleware: function (req: any, next: any) {
    // Get the current context
    const context = req.getContext();
    context.connectionParams.authorization = getToken();
    next();
  }
};

// Not supported `graphql-ws` protocol on server!!
// https://www.apollographql.com/docs/react/data/subscriptions/
/**
 * import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
 * import { createClient } from 'graphql-ws';
 *
 * const wsLink = new GraphQLWsLink(createClient({
 *   url: 'ws://localhost:4000/subscriptions',
 * }));
 */
const getSubscriptionClient = (webSocketURL: string) => {
  return new SubscriptionClient(webSocketURL, {
    reconnect: true,
    timeout: 30000,
    connectionParams: () => ({
      authorization: getToken()
    })
  });
};

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
// Depending on what kind of operation is being sent
const getSplitLink = (webSocketLink: WebSocketLink, httpLink: ApolloLink): ApolloLink => {
  return split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    webSocketLink,
    httpLink
  );
};

const getAuthLink = () => {
  return setContext((_, { headers }) => {
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: getToken()
      },
      connectionParams: {
        authorization: getToken()
      }
    };
  });
};

const getClient = (): ApolloClient<NormalizedCacheObject> => {
  const authLink = getAuthLink();

  if (!WEB_SOCKET_URL) {
    throw new Error(NO_WEB_SOCKET_URL_SET_ERROR);
  }

  const subscriptionClient = getSubscriptionClient(WEB_SOCKET_URL);

  subscriptionClient.use([subscriptionMiddleware]);

  // Before reconnecting here ask if token has expired, if yes get the new token
  subscriptionClient.onReconnecting(async () => {
    if (!isTokenExpired()) {
      const json = await onRefreshToken();
      const newAccessToken = json?.data?.refreshTokenV2?.access_token;

      if (newAccessToken) {
        const expirationToken = getTokenExpiration();

        localStorage.setItem(TokenStorageKey.EXPIRATION, JSON.stringify(expirationToken));
        localStorage.setItem(TokenStorageKey.ACCESS, JSON.stringify(newAccessToken));
      }
    }
  });

  const webSocketLink = new WebSocketLink(subscriptionClient);
  const refreshTokenLink = getRefreshTokenLink();
  const httpLink = getHttpLink();
  const splitLink = getSplitLink(webSocketLink, httpLink);

  return new ApolloClient({
    link: refreshTokenLink.concat(authLink).concat(splitLink),
    cache: new InMemoryCache()
  });
};

export const AuthService = {
  getClient
};
