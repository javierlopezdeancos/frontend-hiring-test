import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { LOGIN } from '../gql/mutations';
import { ME } from '../gql/queries/me';
import { useLocalStorage } from './useLocalStorage';
import { useMutation, useQuery } from '@apollo/client';
import type { LoginInput, AuthResponseType } from '../declarations/auth';
import { AppStatus } from '../constants/app';
import { USER_LOGIN_ROUTE } from '../constants/user';
import { TokenStorageKey } from '../constants/token';
import { CALLS_ROUTE } from '../constants/call';
import { getTokenExpiration } from '../helpers/token';

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
  const [, setTokenExpiration] = useLocalStorage(TokenStorageKey.EXPIRATION, undefined);
  const [accessToken, setAccessToken] = useLocalStorage(TokenStorageKey.ACCESS, undefined);
  const [, setRefreshToken] = useLocalStorage(TokenStorageKey.REFRESH, undefined);
  const [loginMutation] = useMutation(LOGIN);
  const { data: currentUser } = useQuery(ME);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && currentUser) {
      setUser(currentUser.me);
    }
  }, [currentUser, user]);

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
        const token_expiration = getTokenExpiration();

        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        setUser(user);
        setTokenExpiration(token_expiration);
        setStatus(AppStatus.LOADED);

        navigate(CALLS_ROUTE);
      }
    });
  };

  const logout = (): void => {
    setAccessToken(null);
    setRefreshToken(null);
    navigate(USER_LOGIN_ROUTE, { replace: true });
  };

  const isAuth = (): boolean => {
    if (!accessToken && !user) {
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
