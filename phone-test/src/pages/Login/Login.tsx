import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TokenStorageKey } from '../../constants/token';
import { Flex, Icon, LogoMarkMono, Spacer, useToast } from '@aircall/tractor';

import { FormState } from './Login.decl';
import { LoginForm } from './LoginForm';
import { useAuth } from '../../hooks/useAuth';

const LOGIN_REJECTED = 'LOGIN_REJECTED';

export const LoginPage = () => {
  const [formState, setFormState] = useState<FormState>('Idle');
  const { login } = useAuth();
  const { showToast, removeToast } = useToast();
  const [search] = useSearchParams();

  const isTokenExpiredRoute = search.get(TokenStorageKey.EXPIRATION)
    ? Boolean(search.get('token_expired'))
    : false;

  const onSubmit = async (email: string, password: string) => {
    try {
      setFormState('Pending');
      await login({ username: email, password });
      removeToast(LOGIN_REJECTED);
    } catch (error) {
      console.log(error);
      showToast({
        id: LOGIN_REJECTED,
        message: 'Invalid email or password',
        variant: 'error'
      });
    }
  };

  useEffect(() => {
    if (isTokenExpiredRoute) {
      showToast({
        id: LOGIN_REJECTED,
        message: 'Your session has expired.',
        variant: 'error'
      });
    }
  }, [isTokenExpiredRoute, showToast]);

  return (
    <Spacer p={5} h="100%" direction="vertical" justifyContent="center" fluid space={5}>
      <Flex alignItems="center">
        <Icon component={LogoMarkMono} size={60} mx="auto" />
      </Flex>
      <LoginForm onSubmit={onSubmit} formState={formState} />
    </Spacer>
  );
};
