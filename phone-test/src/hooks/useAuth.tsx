import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { LOGIN } from '../gql/mutations';
import { ME } from '../gql/queries/me';
import { useMutation, useQuery } from '@apollo/client';
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
  user: {} as UserType
});

export interface AuthProviderProps {
  login: ({ username, password }: LoginInput) => Promise<any>;
  logout: () => void;
  isAuth: () => boolean;
  user: UserType;
}

export const AuthProvider = () => {
  const [user, setUser] = useState<UserType>();
  const navigate = useNavigate();

  const [loginMutation] = useMutation(LOGIN);
  const { data: currentUser } = useQuery(ME);

  useEffect(() => {
    if (!user) {
      currentUser && setUser(currentUser.me);
    }
  }, [currentUser, user]);

  const login = useCallback(
    ({ username, password }: LoginInput): Promise<any> => {
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

          localStorage.setItem(TokenStorageKey.ACCESS, JSON.stringify(access_token));
          localStorage.setItem(TokenStorageKey.REFRESH, JSON.stringify(refresh_token));
          localStorage.setItem(TokenStorageKey.EXPIRATION, JSON.stringify(token_expiration));

          setUser(user);
          navigate(CALLS_ROUTE);
        }
      });
    },
    [loginMutation, navigate]
  );

  const logout = useCallback((): void => {
    localStorage.removeItem(TokenStorageKey.ACCESS);
    localStorage.removeItem(TokenStorageKey.REFRESH);
    localStorage.removeItem(TokenStorageKey.EXPIRATION);

    navigate(USER_LOGIN_ROUTE, { replace: true });
  }, [navigate]);

  const isAuth = useCallback((): boolean => {
    const accessToken = localStorage.getItem(TokenStorageKey.ACCESS);

    if (!accessToken) {
      return false;
    }

    return true;
  }, []);

  const value = useMemo(() => {
    return {
      login,
      logout,
      isAuth,
      user: (user || currentUser) as UserType
    };
  }, [user, currentUser, login, logout, isAuth]);

  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
