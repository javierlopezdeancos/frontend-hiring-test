import { createContext, useContext, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { LOGIN } from '../gql/mutations';
import { useLocalStorage } from './useLocalStorage';
import { useMutation } from '@apollo/client';
import type { LoginInput, AuthResponseType } from '../declarations/auth';
import { AppStatus } from '../constants/app';
import { UserLocalStorageKey, TOKEN_EXPIRATION_MINUTES } from '../constants/user';

const AuthContext = createContext({
  login: ({ username, password }: LoginInput): Promise<any> =>
    new Promise(resolve => {
      resolve({} as AuthResponseType);
    }),
  logout: () => {},
  isAuth: () => Boolean(false),
  status: AppStatus.LOADED,
  user: {} as UserType
});

export interface AuthProviderProps {
  login: ({ username, password }: LoginInput) => Promise<any>;
  logout: () => void;
  isAuth: () => boolean;
  status: AppStatus.LOADING & AppStatus.LOADED;
  user: UserType;
}

export const AuthProvider = () => {
  const [user, setUser] = useState<UserType>();
  const [status, setStatus] = useState(AppStatus.LOADING);

  const [, setTokenExpiration] = useLocalStorage(UserLocalStorageKey.TOKEN_EXPIRATION, undefined);

  const [, setAccessToken] = useLocalStorage(UserLocalStorageKey.ACCESS_TOKEN, undefined);

  const [, setRefreshToken] = useLocalStorage(UserLocalStorageKey.REFRESH_TOKEN, undefined);

  const [loginMutation] = useMutation(LOGIN);
  const navigate = useNavigate();

  const getTokenExpiration = (): Date =>
    new Date(new Date().getTime() + TOKEN_EXPIRATION_MINUTES * 60000);

  const login = ({ username, password }: LoginInput): Promise<any> => {
    return loginMutation({
      variables: {
        input: {
          username,
          password
        }
      },
      onCompleted: ({ login }: any): void => {
        const { access_token, refresh_token, user }: AuthResponseType = login;
        const tokenExpiration = getTokenExpiration();

        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        setUser(user);
        setTokenExpiration(tokenExpiration);
        setStatus(AppStatus.LOADED);
        navigate('/calls');
      }
    });
  };

  const logout = (): void => {
    setAccessToken(null);
    setRefreshToken(null);
    navigate('/login', { replace: true });
  };

  const isAuth = (): boolean => {
    const accessTokenInLocalStorage = localStorage.getItem(UserLocalStorageKey.ACCESS_TOKEN);

    const accessTokenIsInLocalStorage =
      accessTokenInLocalStorage !== null && accessTokenInLocalStorage !== undefined;

    if (!accessTokenIsInLocalStorage) {
      return false;
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isAuth,
        status,
        user: user as UserType
      }}
    >
      <Outlet />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
